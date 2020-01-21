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
        let quote = new InsuranceQuote({waitlistId: record.id});
        yield quote.save();
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
        sequelize.literal(`concat_ws(' ', first_name, last_name, place_name, notes) like '%${queryIn.search}%'`)
      ] };
      query.order = [ ['created_at', 'asc'] ];
    } else {
      query.where = { user_id: null };
    }
    if (queryIn.type) {
      query.where.accountType = queryIn.type;
    }
    if(queryIn.type === 'waivework') {
      query.order = [ 
        [ 'priority', 'desc' ] ,
        [ 'hours', 'desc' ],
        [ 'days', 'desc', ],
        [ 'experience', 'desc' ],
        [ 'created_at', 'asc' ]
      ];
    }

    query.limit = parseInt(queryIn.limit, 10);
    query.offset = parseInt(queryIn.offset, 10);

    return yield Waitlist.find(query);
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
    try {
      yield Intercom.addTag(payload, 'WaiveWork');
    } catch(e) {
      yield Intercom.addUser(payload);
      yield Intercom.addTag(payload, 'WaiveWork');
    }
    data = {...payload, ...data};
    data.rideshare = payload.rideshare === 'true' ? 'yes' : 'no';
    data.birthDate = moment(payload.birthDate).format('MM/DD/YYYY'); 
    data.expirationDate = moment(payload.expirationDate).format('MM/DD/YYYY'); 
    try {
      let email = new Email();
      yield email.send({
        to       : 'dennis.mata.t7h8@statefarm.com',
        cc       : 'work@waive.car',
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

    let introMap = {
      waitlist: "Thanks for your patience. It's paid off because you are next in line and we've created your account.",
      waivework: `<p>Welcome to our WaiveWork program! If you're receiving this email, it means you've been approved and are ready to set next steps. Congrats! Ready to ride the Waive? Here's what happens next!</p><p>Your weekly payment will be $${opts.perWeek} and includes scheduled maintenance, insurance and the car. We will need to process your first weeks payment, and send you over the 30-day contract once it goes through. You will receive a copy of the contract for you to completely review and discuss any questions you have before receiving the actual Docusign and signing. Please keep in mind our billing days are the 1st, 8th, 15th and the 22nd. If you are starting on a different date, a prorated payment will be due based off the number of days left until the next billing day. If you don't have a payment method on file, you will need to add one. This will be due prior to picking up the vehicle, as well as the signed contract. Without both, you will not have a confirmed reservation for vehicle pick-up.</p><p>Once the contract is signed, you will need to schedule your pick-up appointment for a weekday during our pick-up hours (9am-6:30pm). Once scheduled, you will be required to set-up your account and password.</p><p>Please don't hesitate to reach out to customer service with any questions you may have     at <a href="mailto:support@waive.car">support@waive.car</a> or by calling <a href="tel:+1855waive55">1 (855) WAIVE-55</a>.</p>`,
      csula: "Welcome aboard Waive's CSULA program.",
      vip: "You've been fast-tracked and skipped the waitlist!"
    }
    if (recordList[0].accountType === 'waivework') {
      opts.intro = 'waivework'
      params.isWaivework = true;
      try {
        yield Intercom.addTag(recordList[0], 'WaiveWork');
      } catch(e) {
        console.log('error tagging user', e);
      }
    }

    opts.intro = opts.intro || 'waitlist';
    if(! (opts.intro in introMap) )  {
      opts.intro = 'waitlist';
    }
    params.intro = introMap[opts.intro];

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

      // We create their user account.
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

      nameList.push(`<${config.api.uri}/users/${userRecord.id}|${fullName}>`);

      // X-ref it back so that we don't do this again.
      // They'd be able to reset their password and that's about it.
      yield record.update({userId: userRecord.id});
      userList.push(userRecord);

      let context = Object.assign({}, params || {}, {
        name: fullName
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
        if (params.isWaivework) {
          yield userRecord.update({isWaivework: true});
          yield notify.sendTextMessage(record, `Congratulations on your acceptance to WaiveWork! Please check your e-mail for further details. Please don't hesitate to reach out with any questions here!`);
          scheduler.add('waivework-reminder', {
            uid   : `waivework-reminder-${userRecord.id}`,
            unique: true,
            timer : {value: 8, type: 'hours'},
            data  : {
              userId: userRecord.id,
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
        }
        emailOpts = {
          to       : record.email,
          from     : config.email.sender,
          subject  : 'Welcome to Waive',
          template : opts.template || template,
          context  : context
        };
        yield email.send(emailOpts);
      } catch(err) {
        log.warn('Failed to deliver notification email: ', emailOpts, err);      
      }
    }
    if (_user) {
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
      let userList = yield this.letInByRecord(recordList, _user, {perWeek: payload.perWeek});
      for(var ix = 0; ix < userList.length; ix++) {
        yield userList[ix].addTag('la');
      }
    }
  },

  *sendWaiveWorkEmail(opts) {
    let email = new Email(), emailOpts = {};
    let context = {...opts, isWaivework: true};
    context.name = `${opts.user.firstName} ${opts.user.lastName}`;
    context.intro = `<p>Welcome to our WaiveWork program! If you're receiving this email, it means you've been approved and are ready to set next steps. Congrats! Ready to ride the Waive? Here's what happens next!</p><p>Your weekly payment will be $${opts.perWeek} and includes scheduled maintenance, insurance and the car. We will need to process your first weeks payment, and send you over the 30-day contract once it goes through. You will receive a copy of the contract for you to completely review and discuss any questions you have before receiving the actual Docusign and signing. Please keep in mind our billing days are the 1st, 8th, 15th and the 22nd. If you are starting on a different date, a prorated payment will be due based off the number of days left until the next billing day. If you don't have a payment method on file, you will need to add one. This will be due prior to picking up the vehicle, as well as the signed contract. Without both, you will not have a confirmed reservation for vehicle pick-up.</p><p>Once the contract is signed, you will need to schedule your pick-up appointment for a weekday during our pick-up hours (9am-6:30pm). Once scheduled, you will be required to set-up your account and password.</p><p>Please don't hesitate to reach out to customer service with any questions you may have     at <a href="mailto:support@waive.car">support@waive.car</a> or by calling <a href="tel:+1855waive55">1 (855) WAIVE-55</a>.</p>`;
    scheduler.add('waivework-reminder', {
      uid   : `waivework-reminder-${opts.user.id}`,
      unique: true,
      timer : {value: 8, type: 'hours'},
      data  : {
        userId: opts.user.id,
      },
    });
    try {
      yield notify.sendTextMessage(opts.user, `Congratulations on your acceptance to WaiveWork! Please check your e-mail for further details. Please don't hesitate to reach out with any questions here!`);
      emailOpts = {
        to       : opts.user.email,
        from     : config.email.sender,
        subject  : 'Welcome to WaiveWork',
        template : 'letin-email-nopass',
        context  : context,
      };
      yield email.send(emailOpts);
    } catch(err) {
      log.warn('Failed to deliver notification email: ', emailOpts, err);      
    }
  }
};
