'use strict';

let error         = Bento.Error;
let Waitlist      = Bento.model('Waitlist');
let User          = Bento.model('User');
let queryParser   = Bento.provider('sequelize/helpers').query;
let config        = Bento.config;
let Email         = Bento.provider('email');
let log           = Bento.Log;
let notify        = Bento.module('waivecar/lib/notification-service');
let sequelize     = Bento.provider('sequelize');
let bcrypt        = Bento.provider('bcrypt');

let UserService = require('./user-service');
let geolib      = require('geolib');
let _           = require('lodash');

let _pri = {
  // This means don't service these users at all.
  'none':    0,

  'default': 1,
  'high':    2,
};

function inside(obj) {
  if ('latitude' in obj && 'longitude' in obj) {
    // see https://github.com/WaiveCar/Waivecar/issues/943
    let ourCenter = { latitude : 34.310074, longitude : -118.455963 };

    // the geolib docs say they report in meters.
    let distance = geolib.getDistance(ourCenter, obj);

    return distance < 145000;
  }
  return false;
}

module.exports = {

  *prioritize(payload, _user) {
    let record = yield Waitlist.findById(payload.id);
    if (record) {
      record.update({priority: _pri.high});
      return record;
    }
  },

  *add(payload, _user) {
    // This is toooottally unauthenticated and anyone can type in any email
    // address so we can't leak information such as someone's location. So
    // we carefully construct what we're returning to the user and only
    // send over the absolute minimum needed.
    //
    // Since this can be hard to find, they are commented with "FIELD"
    let res = {};
    let user = false;
    let data = {};

    let requiredList = ['firstName', 'lastName', 'email', 'placeName'];
    var promo = '';

    if(payload.promoCode) {
      promo = payload.promoCode.toLowerCase();
    }

    if(promo === 'levelbk') {
      payload.placeName = 'brooklyn';
    }

    // only accept certain fields...
    ['accountType', 'days', 'hours', 'experience', 'password', 'phone', 'latitude', 'longitude', 'firstName', 'lastName', 'email', 'placeName', 'placeId'].forEach((field) => {
      if (! (field in payload) ) {
        if ( requiredList.indexOf(field) !== -1) {
          throw error.parse({
            code    : 'MALFORMED QUERY',
            message : 'You need to post ' + field
          }, 400);
        }
      } else {
        data[field] = payload[field];
      }
    });

    payload.email = payload.email.toLowerCase();

    // we store it encrypted and then pass it over to the 
    // userservice using a special passwordEncrypted parameter
    // so as not to be encrypted again.
    if (data.password) {
      data.password = yield bcrypt.hash(data.password, 10);
    }

    // We first see if the person has already tried to join us previously
    let record = yield Waitlist.findOne({ where: { email: payload.email } });

    // If a legacy user which never appeared in the waitlist is trying to rejoin
    // we should be able to find them as well.
    if (!record) {
      user = yield User.findOne({ where: { email: payload.email } });
    }

    if (record || user) {
      // They've signed up before, that's chill. 
      
      if (record) {
        // We always update the signup_count regardless
        yield record.update({signupCount: record.signupCount + 1 });
      }

      // If there's a user id then we've already signed them up
      // so we just try it all again. The letin code is smart enough to
      // just send out emails and not create duplicate records
      if (user) {
        yield this.letInByRecord(user, _user);

        // we set a magical custom flag
        
        // FIELD
        res.alreadyLetIn = 'yes';

      // Otherwise if it's a user that's established.`
      } else if(user) {
        res.established = 'yes';
      } else {
        res.signedUp = 'yes';
      }
    } else {
      // We haven't seen this person before... 

      let isInside = inside(payload);
      // If they are outside la then we just give them
      // a priority of 0, otherwise it's 1. Note the plus
      // sign to duck type the boolean to an int.
      //
      // oh what fun type systems are!
      data.priority = +isInside;

      record = new Waitlist(data);

      // If this is a valid waivework signup
      if (isInside && data['accountType'] == 'waivework') {
        res.waivework = 'yes';
      } else {
        // FIELD
        res.inside = isInside ? 'yes' : 'no';

        // If we are outside then because of the architecture we
        // are going to pass back the record id so the person can
        // opt in on the next page
        if (!isInside) {

          // FIELD
          res.id = record.id;
        }
      }

      yield record.save();
    }

    if(promo === 'vip' || promo === 'seekdiscomfort') {
      res.fastTrack = 'yes';
      delete res.inside;
      user = yield this.letInByRecord([record]);
      user = userList[0];

      let UserNote = Bento.model('UserNote');

      let note = new UserNote({
        userId: user.id,
        // the author id currently can't be null
        // so we make it the level fleet account
        authorId: 14827,
        content: promo,
        type: 'promo'
      });
      yield note.save();

    } else if(promo === 'hyrecar') {
      // This means they can skip the line -
      // it's more of a communication to the app
      // then it is any functional thing.
      res.fastTrack = 'yes';
      res.hyrecar = 'yes';
      delete res.inside;
      yield this.letInByRecord([record]);
    } else if(promo === 'levelbk') {
      res.level = 'yes';
      res.fastTrack = 'yes';
      delete res.inside;
      let userList = yield this.letInByRecord([record], null, {email: 'level-letin'});

      user = userList[0];

      // we need to save what the user said their
      // unit or account number
      yield user.addTag('level');

      let UserNote = Bento.model('UserNote');
      let note = new UserNote({
        userId: user.id,
        // the author id currently can't be null
        // so we make it the level fleet account
        authorId: 14827,
        content: payload.account,
        type: 'unit'
      });
      yield note.save();
    }

    return res;
  },

  // This is a user-instantiated function (not administrator) and
  // it's for people who are not in los angeles but want to be added 
  // to the waitlist anyway.
  //
  // They are already on the waitlist actually, we just don't service
  // them because their priority is null.  So what we do here is give
  // them the default priority level.
  *addById(payload) {
    let record = yield Waitlist.findById(payload.id);
    if(record && record.prioriy == _pri.none) {
      yield record.update({priority: _pri.default});
    }
  },

  *index(queryIn, _user) {
    let query = {order: [ ['created_at', 'desc'] ] };
    // 
    // Only return users that we haven't let in already
    //
    if (queryIn.search) {
      query.where = { $and: [
        {user_id: null },
        sequelize.literal(`concat_ws(' ', first_name, last_name, place_name) like '%${queryIn.search}%'`)
      ] };
    } else {
      query.where = { user_id: null };
    }
    query.limit = parseInt(queryIn.limit, 10);
    query.offset = parseInt(queryIn.offset, 10);

    return yield Waitlist.find(query);
  },

  //
  // letin and take are somewhat different.  The "take" name and idea is borrowed 
  // from ruby's array#take method https://apidock.com/ruby/Array/take  ... its 
  // just to essentially dequeue some quantity of records.  The letin function 
  // is what converges the waitlist users to actual users.
  //
  *letInByRecord(recordList, _user, opts) {
    opts = opts || {};
    let nameList = [];
    let userList = [];

    for(var ix = 0; ix < recordList.length; ix++) {

      let record = recordList[ix];
      let userRecord = false;
      let fullName = `${record.firstName} ${record.lastName}`;

      // We create their user account.
      try {
        userRecord = yield UserService.store({
          firstName: record.firstName,
          lastName: record.lastName,
          // we already bcrypted their password when
          // we passed it into the waitlist
          passwordEncrypted: record.password,
          phone: record.phone,
          email: record.email,
          status: 'pending'
        }, _user);
      } catch(ex) {
        userRecord = yield User.findOne({ 
          where: { 
            $or: [
              { email: record.email },
              { phone: record.phone } 
            ]
          }
        });

        if (userRecord) {
          // Even if we've seen the user before, and they are
          // trying to sign up again, we send them another invite 
          // in good faith, going through the entire process again,
          // presuming that they didn't receive or lost the previous. 
          log.warn(`Found user with email ${ record.email } or phone ${ record.phone }. Not adding`);
          yield record.update({userId: userRecord.id});
        } else {
          log.warn(`Unable to add user with email ${ record.email } and phone ${ record.phone }`);
          console.log(ex);
          continue;
        }
      }

      nameList.push(`<${config.api.uri}/users/${userRecord.id}|${fullName}>`);

      // X-ref it back so that we don't do this again.
      // They'd be able to reset their password and that's about it.
      yield record.update({userId: userRecord.id});
      userList.push(userRecord);

      let res = yield UserService.generatePasswordToken(userRecord, 7 * 24 * 60);
    
      // If a candidate signs up again we "re-let" them in ... effectively sending them the same email again
      let email = new Email(), emailOpts = {};
      try {
        emailOpts = {
          to       : record.email,
          from     : config.email.sender,
          subject  : 'Welcome to WaiveCar',
          template : opts.email || 'waitlist-letin-email',
          context  : {
            name: fullName,
            passwordlink: `${config.api.uri}/reset-password?hash=${res.token.hash}&isnew=yes`
          }
        };
        yield email.send(emailOpts);
      } catch(err) {
        log.warn('Failed to deliver notification email: ', emailOpts);      
      }
    }
    if (_user) {
      let list = nameList.slice(0, -2).join(',') + nameList.slice(-2).join(' and ');
      yield notify.notifyAdmins(`:rocket: ${ _user.name() } let in ${ list }`, [ 'slack' ], { channel : '#user-alerts' })
    }
    return userList;
  },

  *letIn(payload, _user) {
    // This is "clever" because we want a round-robin fashion.
    // So the sql that we want is essentially:
    //
    //  select * from waitlist 
    //    where 
    //      user_id is null 
    //      and priority > 0
    //
    //    group by priority 
    //
    //    order by 
    //      priority desc, 
    //      created_at asc;
    //
    // Because of how "broken" group by is when not using an aggregator, it returns us
    // the first record at each priority level. This makes sure that the higher priority
    // people will come in ahead of, but not exclusively
    let recordList = [];
    if('idList' in payload) {
      recordList = yield Waitlist.find({ where : { id : { $in: payload.idList } } });
    } else {
      let letInCount = parseInt(payload.amount, 10);

      if (letInCount) {
        recordList = yield Waitlist.find({ 
          where: {
            user_id: null,
            account_type: 'normal',
            priority: { $gt: 0 }
          },
          order: [
            [ 'priority', 'desc'  ],
            [ 'created_at', 'asc' ]
          ],
          limit: letInCount
        });
      } else {
        log.warn(`0 people requested to be let in. This may be an error`);
      }
    }
    if(recordList.length) {
      yield this.letInByRecord(recordList, _user);
    }
  }

};
