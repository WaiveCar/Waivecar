'use strict';

let error         = Bento.Error;
let Waitlist      = Bento.model('Waitlist');
let InsuranceQuote = Bento.model('InsuranceQuote');
let User          = Bento.model('User');
let queryParser   = Bento.provider('sequelize/helpers').query;
let config        = Bento.config;
let Email         = Bento.provider('email');
let log           = Bento.Log;
let notify        = Bento.module('waivecar/lib/notification-service');
let sequelize     = Bento.provider('sequelize');
let bcrypt        = Bento.provider('bcrypt');
let moment        = require('moment');
let scheduler = Bento.provider('queue').scheduler;
let OrderService = require('../../shop/lib/order-service');
let LicenseService = require('../../license/lib/license-service');
let Intercom = require('../../user/lib/intercom-service');


let UserService = require('./user-service');
let geolib      = require('geolib');
let _           = require('lodash');

let _pri = {
  // This means don't service these users at all.
  'none':    0,

  'default': 1,
  'high':    2,
};

let introMap = {
  waitlist: {email: "Thanks for your patience. It's paid off because you are next in line and we've created your account."},
  accepted: {
    sms: `Congratulations! You have been approved for WaiveWork Please check your e-mail for further details.` 
  },
  rejected: {
    sms: 'Unfortunately, you have not been approved for WaiveWork. Please check your e-mail for further details'
  },
  incomplete: {
    sms: `Thanks for signing up for WaiveWork. To process your request, we need some further information. Please check your e-mail for more details.`
  },
  nonmarket: {
    sms: 'Unfortunately, you have not been approved for WaiveWork. Please check your e-mail for further details'
  },
  csula: {email: "Welcome aboard Waive's CSULA program."},
  vip: {email: "You've been fast-tracked and skipped the waitlist!"},
}

function inside(obj) {
  if ('latitude' in obj && 'longitude' in obj) {
    // see https://github.com/WaiveCar/Waivecar/issues/943
    let ourCenter = { latitude : 34.310074, longitude : -118.455963 };

    // the geolib docs say they report in meters.
    let distance = geolib.getDistance(ourCenter, obj);

    return distance < 80467;
  } 
  return false;//(obj.placeName.search(/los angeles|culver city|beverly hills|santa monica/i) != -1);
}

module.exports = {

  *addNote(payload, _user) {
    let record = yield Waitlist.findById(payload.id);
    if (record) {
      var notes = [];
      try {
        notes = JSON.parse(record.notes);
      } catch(ex) {
        notes = [];
      }
      if(!notes || !(Array.isArray(notes))) {
        notes = [];
      }
      notes.push(payload.note);
    }
    yield record.update({notes: JSON.stringify(notes)});
    return record;
  },

  *deleteNote(payload, _user) {
    let record = yield Waitlist.findById(payload.id);
    let notes = JSON.parse(record.notes);
    let removalIdx = notes.indexOf(payload.note);
    if (removalIdx >= 0) {
      notes.splice(removalIdx, 1);
    }
    yield record.update({notes: JSON.stringify(notes)});
  },

  *prioritize(payload, _user) {
    let record = yield Waitlist.findById(payload.id);
    if (record) {
      yield record.update({priority: record.priority + +payload.direction});
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
    let isInside = '';

    if(payload.promoCode) {
      promo = payload.promoCode.toLowerCase();
    }

    if(promo === 'levelbk') {
      payload.placeName = 'brooklyn';
    }
    if(!payload.placeName) {
      payload.placeName = promo;
    }

    // only accept certain fields...
    ['accountType', 'days', 'hours', 'experience', 'password', 'phone', 'latitude', 'longitude', 'firstName', 'lastName', 'email', 'placeName', 'placeId'].forEach((field) => {
      if (! (field in payload) ) {
        if ( requiredList.indexOf(field) !== -1) {
          throw error.parse({
            code    : 'MALFORMED QUERY',
            message : `The ${ field } field cannot be empty. Please contact us if you think this is in error.`
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
    let searchOpts = { 
      where: { 
        $or: [ { email: payload.email } ]
      }
    };

    if(payload.phone && payload.phone.length) {
      searchOpts.where['$or'].push({ phone: payload.phone });
    }

    // We first see if the person has already tried to join us previously
    let record = yield Waitlist.findOne(searchOpts);
    // If a legacy user which never appeared in the waitlist is trying to rejoin
    // we should be able to find them as well.
    if (!record) {
      user = yield User.findOne(searchOpts);
    }
    if (record || user) {
      // They've signed up before, that's chill. 
      if (record) {
        // We always update the signup_count regardless
        yield record.update({signupCount: record.signupCount + 1 });
        payload.waitlistId = record.id;
        if(data.accountType == 'waivework') {
          yield record.update({notes: JSON.stringify([JSON.stringify({...data, ...payload})])});
        }
      }

      // If there's a user id then we've already signed them up
      // so we just try it all again. The letin code is smart enough to
      // just send out emails and not create duplicate records
      if (user) {
        yield this.letInByRecord([user], _user);
        // we set a magical custom flag
        
        // FIELD
        res.alreadyLetIn = 'yes';

      // Otherwise if it's a user that's established.`
      } else if (user) {
        res.established = 'yes';
      } else {
        res.signedUp = 'yes';
      }
    } else {
      // We haven't seen this person before... 

      isInside = false;//inside(payload);

      // If they are outside la then we just give them
      // a priority of 0, otherwise it's 1. Note the plus
      // sign to duck type the boolean to an int.
      //
      // oh what fun type systems are!
      data.priority = +isInside;

      record = new Waitlist(data);
      yield record.save();
      if(data.accountType == 'waivework') {
        // I am commenting this out because it may not need to be done at this time
        //yield Intercom.addUser(record)
        yield record.update({
          notes: JSON.stringify([JSON.stringify({...data, ...payload})]),
        });
        payload.waitlistId = record.id;
      }

      // If this is a valid waivework signup
      if (data['accountType'] == 'waivework') {
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
    }

    if(data['accountType'] != 'waivework') {
      /*
      if(promo === 'vip' || promo === 'seekdiscomfort' || promo === 'high5') {
        res.fastTrack = 'yes';
        delete res.inside;
        let userList = yield this.letInByRecord([record], null, {intro: 'vip', promo: promo});
        user = userList[0];

        if(user) {
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
        }
        yield user.addTag('la');

      } else */if (promo === 'csula-student' || promo === 'csula-staff' || promo.match(/^cal/)) {
        res.csula = 'yes';
        res.fastTrack = 'yes';
        delete res.inside;
        let userList = yield this.letInByRecord([record], null, {intro: 'csula', promo: promo});

        user = userList[0];

        // we need to save what the user said their
        // unit or account number
        yield user.addTag('csula');

        // TODO: remove this after new release (2018-11-15)
        yield user.update({tested: true});

        let UserNote = Bento.model('UserNote');
        let note = new UserNote({
          userId: user.id,
          // the author id currently can't be null
          // so we make it the level fleet account
          authorId: 14827,
          content: [promo, payload.account].join(' '),
          type: 'unit'
        });
        yield note.save();
      } /*else if(promo === 'levelbk') {
        res.level = 'yes';
        res.fastTrack = 'yes';
        delete res.inside;
        let userList = yield this.letInByRecord([record], null, {template: 'level-letin'});

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
      } else if (isInside) {
        let userList = yield this.letInByRecord([record], null, {intro: 'vip'});
        res.fastTrack = 'yes';
        user = userList[0];
        if(user) {
          yield user.addTag('la');
        } else {
          console.log("The following produced an error", record);
        }
      }*/
    }
    if (data.accountType === 'waivework') {
      yield this.requestWorkQuote(payload, data);
      res.waivework = 'yes';
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
        sequelize.literal(`concat_ws(' ', first_name, last_name, place_name, notes) like '%${queryIn.search}%'`),
      ]};

      if (queryIn.status && queryIn.status !== 'all') { 
        query.where.$and.push({status: queryIn.status}) 
      }
      query.order = [ ['created_at', 'asc'] ];
    } else {
      query.where = { user_id: null };
    }
    if (queryIn.type) {
      query.where.accountType = queryIn.type;
    }
    if(queryIn.type === 'waivework') {
      query.order = [ 
        [ 'created_at', 'asc' ]
      ];
      // The waivework waitlist should only send
      if (queryIn.status && queryIn.status !== 'all') {
        query.where.status = queryIn.status;
      }
      query.include = [{
        model: 'InsuranceQuote',
        as: 'insuranceQuotes',
        required: false,
        order: [['created_at', 'asc']],
      }];
    }

    query.limit = parseInt(queryIn.limit, 10);
    query.offset = parseInt(queryIn.offset, 10);

    return yield Waitlist.find(query);
  },

  *insuranceQuotes(queryIn) {
    let query = {};
    query.order = [ 
      ['expiresAt', 'desc']
    ];
    query.include = [{
      model: 'User',
      as: 'user',
      required: false,
    }, {
      model: 'Waitlist',
      as: 'waitlist',
      required: false,
    }];
    query.where = {
      amount: {$not: null},
      expiresAt: {$gt: moment().format('YYYY-MM-DD')},
      accepted: true,
    };

    query.limit = parseInt(queryIn.limit, 10);
    query.offset = parseInt(queryIn.offset, 10);
    return yield InsuranceQuote.find(query);
  },

  *FBletIn(idList, _user) {
    let params = {};
    let nameList = [];
    let userList = [];

    params.intro = "Thanks for your patience. It's paid off because you are next in line and we've created your account.";

    for(var ix = 0; ix < idList.length; ix++) {
      let userRecord = yield User.findOne({where: { 
        id: idList[ix]
      }});

      if (userRecord) {
        let fullName = `${userRecord.firstName} ${userRecord.lastName}`;
        if(userRecord.status === 'waitlist') {
          nameList.push(`<${config.api.uri}/users/${userRecord.id}|${fullName}>`);
          yield userRecord.update({status: 'active'});
          let email = new Email(), emailOpts = {};
          try {
            emailOpts = {
              to       : userRecord.email,
              from     : config.email.sender,
              subject  : 'Welcome to Waive',
              template : 'letin-email-fb',
              context  : Object.assign({}, params || {}, {
                name: fullName,
              })
            };
            yield email.send(emailOpts);
          } catch(err) {
            log.warn('Failed to deliver notification email: ', emailOpts, err);      
          }
        } else {
          // Otherwise, the user is onboarded and we should just continue
          // with the next user and make sure we don't add them to the email
          // list or generate a reset token.
          continue;
        }
      } else {
        log.warn(`Unable to add user with email ${ userRecord.email } and phone ${ userRecord.phone }`);
        continue;
      }
    }
    if (_user) {
      let list = nameList.slice(0, -2).join(', ') + (nameList.length > 2 ? ', ' : ' ') + nameList.slice(-2).join(' and ');
      yield notify.notifyAdmins(`:rocket: ${ _user.name() } let in ${ list }`, [ 'slack' ], { channel : '#user-alerts' })
    }
    return userList;
  },

  *requestWorkQuote(payload, data) {
    /* Users should now be added to intercom, but if they are not, this may need to be put back in
    try {
      yield Intercom.addTag(payload, 'WaiveWork');
    } catch(e) {
      yield Intercom.addUser(payload);
      yield Intercom.addTag(payload, 'WaiveWork');
    }
    */
    // This looks for an old quote that is not expired yet
    let oldQuote = yield InsuranceQuote.findOne({where: {$or: [{userId: payload.userId}, {waitlistId: payload.waitlistId}], expiresAt: {$or: [{$gt: moment().format('YYYY-MM-DD')}, null] }}});
    if (!oldQuote) {
      // this should only be created if there is not already a valid saved quote
      let quote = new InsuranceQuote({
        userId: payload.userId,
        waitlistId: payload.waitlistId,
      });
      yield quote.save();
    }

    data = {...payload, ...data};
    data.rideshare = payload.rideshare === 'true' ? 'yes' : 'no';
    data.birthDate = moment(payload.birthDate).format('MM/DD/YYYY'); 
    data.expirationDate = moment(payload.expirationDate).format('MM/DD/YYYY'); 
    try {
      let email = new Email();
      yield email.send({
        to       : 'dennis.mata.t7h8@statefarm.com',
        cc       : 'work@waive.com',
        from     : config.email.sender,
        subject  : `${data['firstName']} ${data['lastName']} - WaiveWork Signup`,
        template : 'waivework-signup',
        context  : {
          ...data
        }
      });
    } catch(ex) {
      console.log("Unable to send email", ex);
    }
    try {
      yield notify.sendTextMessage(data, `Thanks for signing up for WaiveWork! You will hear back from us regarding your eligability in about 2 business days.`);
      let email = new Email();
      yield email.send({
        to       : data.email,
        from     : config.email.sender,
        subject  : `${data['firstName']} ${data['lastName']} - WaiveWork Signup`,
        template : 'waivework-confirmation',
        context  : {
          name: `${data['firstName']} ${data['lastName']}`,
        }
      });
    } catch(ex) {
      console.log("Unable to send email", ex);
    }
  },

  //
  // letin and take are somewhat different.  The "take" name and idea is borrowed 
  // from ruby's array#take method https://apidock.com/ruby/Array/take  ... its 
  // just to essentially dequeue some quantity of records.  The letin function 
  // is what converges the waitlist users to actual users.
  //
  *letInByRecord(recordList, _user, opts) {
    opts = opts || {};
    let params = {};
    let nameList = [];
    let userList = [];
    let template = 'letin-email';

    if (recordList[0].accountType === 'waivework') {
      opts.intro = opts.status;
      params.isWaivework = true;
      /* They will now be added to intercom only when they login to waivework.com
      try {
        yield Intercom.addTag(recordList[0], 'WaiveWork');
      } catch(e) {
        console.log('error tagging user', e);
      }
      */
    }

    opts.intro = opts.intro || 'waitlist';
    if(! (opts.intro in introMap) )  {
      opts.intro = 'waitlist';
    }
    params.intro = introMap[opts.intro].email;

    if(opts.promo === 'high5') {
      params.intro += ' Your account is now active with $5.00 in credit. It only gets better from here.';
    }

    for(var ix = 0; ix < recordList.length; ix++) {
      let record = recordList[ix];
      let userRecord = false;
      let fullName = `${record.firstName} ${record.lastName}`;
      let isCsula = record.location === 'csula';

      let userOpts = {
        firstName: record.firstName,
        lastName: record.lastName,
        // we already bcrypted their password when
        // we passed it into the waitlist
        passwordEncrypted: record.password,
        email: record.email,
        status: 'active',
      };

      if (record.phone) {
        userOpts.phone = record.phone;
      }
      
      // We create their user account, but only if it is not one of the statuses to skip letting in.
      if (!['rejected', 'incomplete', 'nonmarket'].includes(opts.status)) {
        try {
          //
          // The issue with this method is that it's orchestrated by the
          // admin and calls a function that sends them a text message
          // to verify their phone number. Stupid. We're adding an option
          // to avoid that nonsense.
          //
          userRecord = yield UserService.store(userOpts, _user, {nosms: true});
          if (opts.promo === 'high5') {
            yield OrderService.quickCharge({ description: "High5 promo signup", userId: userRecord.id, amount: -500 }, false, {overrideAdminCheck: true });
          }

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
            if (params.isWaivework) {
              throw error.parse({
                code    : 'Already signed up',
                message: 'The user is already an active WaiveCar user. Please add them to WaiveWork from their profile.',
              }, 400);
            }
            yield record.update({userId: userRecord.id});
            if(userRecord.status === 'waitlist') {
              yield userRecord.update({status: 'active'});
            } else {
              // If the user is csula, they need to be put in the user list so that the correct tags can be added to their user 
              // entry back around line 249
              if (opts.intro === 'csula') {
                userList.push(userRecord);
              }
              // Otherwise, the user is onboarded and we should just continue
              // with the next user and make sure we don't add them to the email
              // list or generate a reset token.
              continue;
            }
          } else {
            log.warn(`Unable to add user with email ${ record.email } and phone ${ record.phone }`);
            if (params.isWaivework) {
              throw error.parse({
                code    : 'Already signed up',
                message: 'There was an error letting user into WaiveWork. Their email and/or phone number may already be associated with an active account.',
              }, 400);
            }
            continue;
          }
        }
      }
      nameList.push(`<${config.api.uri}/users/${userRecord.id}|${fullName}>`);

      // X-ref it back so that we don't do this again.
      // They'd be able to reset their password and that's about it.
      yield record.update({userId: userRecord.id, status: opts.status ? opts.status : record.status});
      userList.push(userRecord);
      // This looks for a quote that is not yet expired
      let quote = yield InsuranceQuote.findOne({where: {waitlistId: record.id, expiresAt: {$gt: moment().format('YYYY-MM-DD')}}});
      // If a quote was not previously created, it must be created here
      // This is done for backwards compatablility for people who previously signed up and do not have empty quotes initialized for them
      if (!quote) {
        quote = new InsuranceQuote({waitlistId: record.id, userId: userRecord.id, amount: opts.perMonth * 100, weeklyPayment: opts.perWeek * 100, expiresAt: opts.quoteExpiration, accepted: opts.status === 'accepted', priority: opts.priority});
        yield quote.save();
      } else {
        yield quote.update({userId: userRecord.id, amount: opts.perMonth * 100, weeklyPayment: opts.perWeek * 100, expiresAt: opts.quoteExpiration, accepted: opts.status === 'accepted', priority: opts.priority});
      }

      let notes = JSON.parse(record.notes);
      let context = Object.assign({}, params || {}, {
        name: record.firstName,
        price: opts.perWeek,
        notes: notes && JSON.parse(notes[notes.length - 1]),
      });
      // If a user set their password through signup then we transfer it over
      if(record.password) {
        template = 'letin-email-nopass';
      } else {
        // otherwise we need to have a password assignment
        let res = yield UserService.generatePasswordToken(userRecord, 7 * 24 * 60);
        context.passwordlink = `${config.api.uri}/reset-password?hash=${res.token.hash}&isnew=yes${params.isWaivework && '&iswork=yes'}`;
      }
    
      // If a candidate signs up again we "re-let" them in ... effectively sending them the same email again
      let email = new Email(), emailOpts = {};
      try {
        context[opts.status] = true;
        // This should only happen if we are actually letting them in and not just updating their waitlist status
        if (params.isWaivework && !['rejected', 'incomplete', 'nonmarket'].includes(opts.status)) {
          yield userRecord.update({isWaivework: true});
          scheduler.add('waivework-reminder', {
            uid   : `waivework-reminder-${opts.status}-${userRecord.id}`,
            unique: true,
            timer : {value: 3, type: 'days'},
            data  : {
              userId: userRecord.id,
              reminderCount: 0,
              type: 'accepted',
              price: opts.perWeek,
            }
          });
          if (record.notes) {
            // The way that I have stored user info in Waitlist not ideal, but should be able to copy 
            // provided license info to our system when they are let in
            let userNotes = JSON.parse(record.notes);
            for (let note of userNotes) {
              try {
                note = JSON.parse(note);
                if (note.accountType && note.accountType === 'waivework') {
                  try {
                    yield LicenseService.store({
                      ...note, 
                      expirationDate: moment(note.expirationDate).format(),
                      birthDate: moment(note.birthDate).format(),
                      userId: userRecord.id, 
                      fromComputer: true,
                    });
                  } catch(e) {
                    console.log('error storing license', e);
                  }
                }
              } catch(e) {
              }
            };
          }
        } else if (opts.status && opts.status === 'incomplete') {
          scheduler.add('waivework-reminder', {
            uid   : `waivework-reminder-${opts.status}-${record.id}`,
            unique: true,
            timer : {value: 3, type: 'days'},
            data  : {
              waitlistId: record.id,
              initialSignupCount: record.signupCount,
              reminderCount: 0,
              type: 'incomplete',
            }
          });
        } 
        if (params.isWaivework) {
          yield notify.sendTextMessage(record, introMap[opts.status].sms);
        }
        emailOpts = {
          to       : record.email,
          from     : config.email.sender,
          subject  : 'Your WaiveWork Application',
          template : opts.template || template,
          context  : context
        };
        yield email.send(emailOpts);
      } catch(err) {
        log.warn('Failed to deliver notification email: ', emailOpts, err);      
      }
    }
    if (_user && !params.isWaiveWork) {
      let list = nameList.slice(0, -2).join(', ') + (nameList.length > 2 ? ', ' : ' ') + nameList.slice(-2).join(' and ');
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
      let userList = yield this.letInByRecord(recordList, _user, {perMonth: payload.perMonth, perWeek: payload.perWeek, quoteExpiration: payload.quoteExpiration, status: payload.status, priority: payload.priority});
      for(var ix = 0; ix < userList.length; ix++) {
        if (userList[ix]) {
          yield userList[ix].addTag('la');
        }
      }
    }
  },

  *sendWaiveWorkEmail(opts) {
    let email = new Email(), emailOpts = {};
    let context = {...opts, isWaivework: true};
    context.name = opts.user.firstName;
    context.intro = introMap[opts.status].email;
    context[opts.status] = true;
    context.price = opts.perWeek;
    // This searches for a quote that has not yet expired
    let quote = yield InsuranceQuote.findOne({where: {userId: opts.user.id, expiresAt: {$gt: moment().format('YYYY-MM-DD')}}});
    // If a non-expired quote already exists, it must be created here
    // This is done for backwards compatablility for people who previously signed up and do not have empty quotes initialized for them
    if (!quote) {
      quote = new InsuranceQuote({userId: opts.user.id, amount: opts.perMonth * 100, weeklyPayment: opts.perWeek * 100, expiresAt: opts.quoteExpiration, accepted: opts.status === 'accepted', priority: opts.priority});
      yield quote.save();
    } else {
      yield quote.update({userId: opts.user.id, amount: opts.perMonth * 100, weeklyPayment: opts.perWeek * 100, expiresAt: opts.quoteExpiration, accepted: opts.status === 'accepted', priority: opts.priority});
    }

    try {
      yield notify.sendTextMessage(opts.user, introMap[opts.status].sms);
      if (opts.status === 'accepted') {
        scheduler.add('waivework-reminder', {
          uid   : `waivework-reminder-${opts.status}-${opts.user.id}`,
          unique: true,
          timer : {value: 3, type: 'days'},
          data  : {
            userId: opts.user.id,
            reminderCount: 0,
            type: opts.status,
            price: opts.perWeek,
          }
        });
      }
      emailOpts = {
        to       : opts.user.email,
        from     : config.email.sender,
        subject  : 'Your WaiveWork Application',
        template : 'letin-email',
        context  : context,
      };
      yield email.send(emailOpts);
    } catch(err) {
      console.log('err', err);
      log.warn('Failed to deliver notification email: ', emailOpts, err);      
    }
  }
};
