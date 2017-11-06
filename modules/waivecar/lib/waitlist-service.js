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

    // only accept certain fields...
    ['accountType', 'days', 'hours', 'experience', 'phone', 'latitude', 'longitude', 'firstName', 'lastName', 'email', 'placeName', 'placeId'].forEach((field) => {
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
        yield this.letIn(user);

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
    }

    return yield Waitlist.find(query);
  },

  //
  // letin and take are somewhat different.  The "take" name and idea is borrowed 
  // from ruby's array#take method https://apidock.com/ruby/Array/take  ... its 
  // just to essentially dequeue some quantity of records.  The letin function 
  // is what converges the waitlist users to actual users.
  //
  *letIn(recordList, _user) {
    
    let nameList = [];

    for(var ix = 0; ix < recordList.length; ix++) {

      let record = recordList[ix];
      let userRecord = false;
      let fullName = `${record.firstName} ${record.lastName}`;

      // We create their user account.
      try {
        userRecord = yield UserService.store({
          firstName: record.firstName,
          lastName: record.lastName,
          email: record.email
        }, _user);
      } catch(ex) {
        userRecord = yield User.findOne({ where: { email: record.email } });

        if (userRecord) {
          yield record.update({userId: userRecord.id});
        } else {
          log.warn('Unable to add user with email ' + record.email);
        }
        continue;
      }

      nameList.push(`<${config.api.uri}/users/${userRecord.id}|${fullName}>`);

      // X-ref it back so that we don't do this again.
      // They'd be able to reset their password and that's about it.
      yield record.update({userId: userRecord.id});

      let res = yield UserService.generatePasswordToken(userRecord);
    
      // If a candidate signs up again we "re-let" them in ... effectively sending them the same email again
      let email = new Email();
      try {
        yield email.send({
          to       : record.email,
          from     : config.email.sender,
          subject  : 'Welcome to WaiveCar',
          template : 'waitlist-letin-email',
          context  : {
            name: fullName,
            passwordlink: `${config.api.uri}/reset-password?hash=${res.token.hash}&isnew=yes`
          }
        });
      } catch(err) {
        log.warn('Failed to deliver notification email: ', err);      
      }
    }
    if (_user) {
      let list = nameList.slice(0, -2).join(',') + nameList.slice(-2).join(' and ');
      yield notify.notifyAdmins(`:rocket: ${ _user.name() } let in ${ list }`, [ 'slack' ], { channel : '#user-alerts' })
    }
  },

  *take(payload, _user) {
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
      }
    }
    if(recordList.length) {
      yield this.letIn(recordList, _user);
    }
  }

};
