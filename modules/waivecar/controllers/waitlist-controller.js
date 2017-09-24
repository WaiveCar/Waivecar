'use strict';

let error = Bento.Error;
let Waitlist = Bento.model('Waitlist');
let User = Bento.model('User');
let _ = require('lodash');

Bento.Register.ResourceController('Waitlist', 'WaitlistController', function(controller) {

  let _pri = {
    // This means don't service these users at all.
    'none':    0,

    'default': 1,
    'high':    2,
  };

  function inside(obj) {
    // see https://github.com/WaiveCar/Waivecar/issues/943
    let ourCenter = { latitude : 34.310074, longitude : -118.455963 };

    // the geolib docs say they report in meters.
    let distance = geolib.getDistance(ourCenter, obj);

    return distance < 145000;
  }

  controller.prioritize = function *(payload, _user) {
    let record = yield Waitlist.findById(payload.id);
    if (record) {
      record.update({priority: _pri.high});
      return record;
    }
  }

  controller.add = function *(payload) {
    // This is toooottally unauthenticated and anyone can type in any email
    // address so we can't leak information such as someone's location. So
    // we carefully construct what we're returning to the user and only
    // send over the absolute minimum needed.
    //
    // Since this can be hard to find, they are commented with "FIELD"
    let res = {};
    let user = false;

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
      
      // We always update the signup_count regardless
      record.update({signupCount: record.signupCount + 1 });

      // If there's a user id then we've already signed them up
      // so we just try it all again. The letin code is smart enough to
      // just send out emails and not create duplicate records
      if (record.userId) {
        yield controller.letin(record);

        // we set a magical custom flag
        
        // FIELD
        res.alreadyLetIn = 'yes';

      // Otherwise if it's a user that's established.`
      } else if(user) {
        res.established = 'yes';
      }
    } else {
      // We haven't seen this person before... 
      let data = {};

      // only accept certain fields...
      ['latitude', 'longitude', 'firstName', 'lastName', 'email', 'placeName', 'placeId'].foreach((field) => {
        data[field] = payload.field;
      });

      let isInside = inside(payload);
      // If they are outside la then we just give them
      // a priority of 0, otherwise it's 1. Note the plus
      // sign to duck type the boolean to an int.
      //
      // oh what fun type systems are!
      data.priority = +isInside;

      rescord = yield Waitlist.create(data);

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
    return res;
  }

  // This is a user-instantiated function (not administrator) and
  // it's for people who are not in los angeles but want to be added 
  // to the waitlist anyway.
  //
  // They are already on the waitlist actually, we just don't service
  // them because their priority is null.  So what we do here is give
  // them the default priority level.
  controller.addById = function *(payload) {
    let record = yield Waitlist.findByid(payload.id);
    if(record && record.prioriy == _pri.none) {
      yield record.update({priority: _pri.default});
    }
  }

  controller.index = function *() {
  }

  //
  // letin and take are somewhat different.  The "take" name and idea is borrowed 
  // from ruby's array#take method https://apidock.com/ruby/Array/take  ... its 
  // just to essentially dequeue some quantity of records.  The letin function 
  // is what converges the waitlist users to actual users.
  //
  function *letIn(recordList) {
    
    for(var ix = 0; ix < recordList.length; ix++) {
      let record = recordList[ix];
      // We create their user account.
      let userRecord = yield User.create({
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email
      });

      // X-ref it back so that we don't do this again.
      record.update({userId: userRecord.id});

      // They'd be able to reset their password and that's about it.
    }
  }

  controller.take = function *(payload) {
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

    let letInCount = parseInt(payload.count, 10);
    let recordList = [];
    while (letInCount > 0) {

      let recordPart = Waitlist.findAll({ 
        where: {
          user_id: null,
          priority: { $gt: 0 }
        },

        group: 'priority',

        order: [
          [ 'priority', 'desc'  ],
          [ 'created_at', 'asc' ]
        ]
      });

      if (recordPart.length === 0) {
        break;
      }

      if (recordPart.length > letInCount) {
        recordPart = recordPart.slice(letInCount);
      }

      // let all these records in
      yield letIn(recordPart);

      letInCount -= recordPart.length
    }
  }

  return controller;
});
