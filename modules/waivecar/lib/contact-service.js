'use strict';

let Email   = Bento.provider('email');
let User    = Bento.model('User');
let Booking = Bento.model('Booking');
let Car     = Bento.model('Car');
let config  = Bento.config;
let notify  = require('./notification-service');
let request = require('co-request');
let url     = require('url');
let booking = require('./booking-service');
let cars    = require('./car-service');
let moment  = require('moment-timezone');
let fs      = require('fs');
let Charger = require('./chargers-service');


module.exports = {
  *deliverMessage(payload, _user) {
    yield notify.slack({ text : `From: ${ _user.link() } ${ _user.email } ${ _user.info() }\n Subject: ${ payload.subject || '_(none)_' }\n${ payload.message || '_(none)_' }` }, { channel : '#app_support' });
    payload.message = payload.message || '';
    yield this.attemptAction(_user, [payload.subject, payload.message].join(' '), {raw: payload.message});
  },

  
  *returnError(user, err, what) {
    var message
    if(err.message) {
      let parts = err.message.split('\t');
      message = parts[0].replace(/<br>/g, '\n');
      message = message.replace(/<[^>]*>/g, '');

      if(err.options) {
        err.options.forEach((row) => {
          if(row.hotkey) {
            message += `\n${ row.title }. Reply "${row.hotkey}"`;
          }
        });
      }

    } else {
      message = "Sorry something went wrong.";
    }
    yield notify.sendTextMessage(user, message + " This is an automated message. Your texts have been forwarded to our support staff.");
    return message;
  },

  *attemptAction(user, command, opts) {
    // alias commands are blank.
    var success = true;
    let sendToSupport = false;
    let guessed = false;
    let documentation = {
      available: "List available WaiveCars",
      book: "Book a WaiveCar. Example:\n   book waive14",
      rush: "WaiveRush a WaiveCar (flat rate)",
      charge: "Charge a WaiveCar with EVgo",
      save: "Add 10 additional minutes to get to a WaiveCar reservation for $1.00 and $0.30/min thereafter",
      "no save": "Opt-out of auto extension",
      "save always": "Opt-in to autoextension",
      "save less": null,
      abort: "Cancel your booking",
      commands: null,
      cancel: null,
      less: null,
      access: null,
      complete: null,
      notify: null,
      rebook: "Rebook the same WaiveCar (possibly for a fee)",
      start: "Start your ride",
      finish: "Finish your ride",
      lock: "Lock the WaiveCar",
      unlock: "Unlock the WaiveCar",
      account: "Information about your account",
    };

    // we try the complex book command first.
    command = command.toLowerCase();
    let argCmd = command.match(/^(rush|book|b|details|d)\s(\w+|\w+\s\d+)$/i);

    // This is a level text
    if(command.match(/we have received your pickup request/)) {
      return true;
    }

    if(argCmd) {

      let license = argCmd[2].replace(/\s/g, '');
      if(license.length < 4) {
        license = 'waive' + license;
      }
      let requestedCar = yield Car.findOne({
        where: {
          isAvailable: true,
          license: {
            $like: `${ license }`
          }
        }
      });
      if(requestedCar) {
        try {
          if(argCmd[1] === 'rush') {
            let res = yield booking.create({
              userId: user.id,
              carId: requestedCar.id,
              opts: {
                rush: true
              }
            }, user);
            console.log(res);
          } else if(['book','b'].includes(argCmd[1])) {
            yield booking.create({
              userId: user.id,
              carId: requestedCar.id
            }, user);
          } else if(['details','d'].includes(argCmd[1])) {
            yield notify.sendTextMessage(user, `${requestedCar.license} is available. It's at ${requestedCar.charge}%. It's current GPS coordinates are https://maps.google.com/?q=${requestedCar.latitude},${requestedCar.longitude}`);
          }
        } catch(ex) {
          yield this.returnError(user, ex, command);
        }
      } else {
        yield notify.sendTextMessage(user, `Unable to access ${license}. Check your spelling.`);
      }
      return true;
    }


    let remoteCmd = command.match(/^charge (\w*)$/i);
    if(remoteCmd) {
      let id = yield Charger.nameToUUID(remoteCmd[1]);
      if(id) {
        yield Charger.start(null, id);
        yield notify.sendTextMessage(user, "Starting " + remoteCmd[1]);
        yield notify.slack({ text : `${user.link()} is charging via sms` }, { channel : '#rental-alerts' });
      } else {
        yield notify.sendTextMessage(user, "Could not find charger '" + remoteCmd[1] + "'. Check the spelling");
      }
      return true;
    }

    // accessing a car from someone else's phone ... top secret command!
    remoteCmd = command.match(/^unlock (waive\d{1,3}) ([^\s]+@[^\s]*\.\w*)$/i);
    if(remoteCmd) {
      let car = yield Car.findOne({where: { license: { $like: remoteCmd[1] } } });
      if(car && car.userId) {
        let user = yield User.findOne({ 
          where: { 
            id: car.userId,
            email: { $like: remoteCmd[2] }
          }
        });
        if(user) {
          yield notify.slack({ text : `:grey_exclamation: ${user.link()} unlocked ${ car.link() } from a different number via email (${ opts.phone })!` }, { channel : '#rental-alerts' });

          // first immobilize then unlock
          yield cars.lockImmobilizer(car.id, user);
          yield cars.unlockCar(car.id, user);
          return false;
        }
      }
    }

    if(user && Object.keys(documentation).indexOf(command) === -1) {
      for(var row of [
        // sometimes we get messages with both "card" and "account" so
        // we pass those up.
        [/ card /, false],
        [/start ride/, 'start'],
        [/ unlock(ing|)/, 'unlock'],
        [/^unlock/, 'unlock'],
        // one character commands
        [/^l$/, 'lock'],
        [/^u$/, 'unlock'],
        [/^f$/, 'finish'],
        [/^s$/, 'start'],

        [/^lock/, 'lock'],
        [/ lock(ing|) /, 'lock'],

        // these were carefully tested over 30,000 historical text messages
        [/(is|does|wo|will|ca).{0,3}n(o|'|)t start/, 'access'],
        [/(won't|not).{0,15}in.*drive /, 'access'],

        [/(immobilize|not starting)/, 'access'],
        [/^start (waive|my ride|ride)/,'start'],
        [/(end|finish|stop) (waive|(my |the |)(rental|ride))/,'finish'],
        [/^end(\s\w+|)$/,'finish']
      ]) {
        let [regex, todo] = row;

        if (command.match(regex)) {
          sendToSupport = true;
          guessed = true;
          command = todo;
          break;
        }
      }
    }

    //
    //
    // now we can do the simple ones.
    //
    //
    if(Object.keys(documentation).indexOf(command) === -1) {
      return false;
    }

    if(command === 'notify') {
      yield user.update({notifyEnd: new Date(+new Date() + 1000 * 1800) });
      yield notify.sendTextMessage(user, "You will be updated of available cars for the next 30 minutes");
      return true;
    }

    if(command === 'commands') {
      let help = [ "Available commands:" ];
      for(var command in documentation) {
        if(documentation[command]) {
          help.push(` ${command} - ${documentation[command]}`);
        }
      }
      help.push( "All other messages sent to this number pass thru to WaiveCar's support staff.");

      yield notify.sendTextMessage(user, help.join('\n'));
      return true;
    }

    if(command === 'available') {
      let carList = yield cars.index(false, user);

      function cleanAddy(addr) {
        return addr.replace(/(, CA|, USA)/g,'');
      }
      
      if(carList.length === 0) {
        yield notify.sendTextMessage(user, "There are no WaiveCars available. :(");
      } else {
        let message = yield carList.map(function *(car) {
          return car.license + " (" + Math.round(car.avgMilesAvailable()) + "mi) " + cleanAddy(yield booking.getAddress(car.latitude, car.longitude));
        });
        yield notify.sendTextMessage(user, message.join('\n'));
      }
     
      return true;
    }

    if(command === 'save always') {
      yield user.addTag('extend');
      yield notify.notifyAdmins(`:rose:The munificent ${ user.link() } added themselves to auto-extend.`, [ 'slack' ], { channel : '#user-alerts' });
      yield notify.sendTextMessage(user, "Thanks for choosing auto-extend. Never lose a car again! You'll buy extensions automatically with each future booking. ($1.00 for 10 extra minutes, then $0.30/min thereafter until you get to the car). Reply \"No save\" to undo this.");
      return true;
    }

    if(command === 'no save') {
      yield user.delTag('extend');
      yield notify.notifyAdmins(`:wilted_flower:The miserly ${ user.link() } removed themselves from auto-extend.`, [ 'slack' ], { channel : '#user-alerts' });
      yield notify.sendTextMessage(user, "Sorry things didn't work out. Auto-extend is canceled. Reply \"Save always\" to extend automatically again. We welcome you to reach out to us to help improve the experience.");
      return true;
    }

    let previousBooking;
    let currentBooking = yield Booking.findOne({ 
      where : { 
        status : {
          $notIn : [ 'completed', 'closed', 'cancelled' ]
        },
        userId : user.id 
      }
    });

    // account may or may not have a current booking if one does or
    // does not exist. So the place that it is processed is important.
    if(command === 'account') {
      let message = [`Hi, ${user.name()}`];

      if(user.credit !== 0) {
        let money = (Math.abs(user.credit)/100).toFixed(2);

        message.push( 
          user.credit < 0 ? 
            `You owe $${money}` : 
            `You have $${money} in credit`
        );
      }

      if(user.status !== 'active') {
        message.push(`Your account status is ${user.status}`);
      }

      if(currentBooking) {
        let mStart = moment.utc(
          moment.duration(
            moment().diff(currentBooking.createdAt)
          ).asMilliseconds()
        );
        let hour = mStart.format('H');
        hour = (hour === '0') ? '' : `${hour}hr `;

        let minute = mStart.format('m');
        minute = (minute === '0') ? '' : `${minute}m `;

        let second = mStart.format('s');
        let car = yield Car.findById(currentBooking.carId);
        var address;
        if(car) {
          address = yield booking.getAddress(car.latitude, car.longitude);
          if(address) {
            address = ', located at ' + address.replace(/, USA/, '');
          } else {
            address = '';
          }
        }

        message.push(`Your booking with ${ car.license }, ${ car.averageCharge() }% charged${address} is ${ currentBooking.status } as of ${hour}${minute}${second}s ago`);
      } else {
        message.push('You do not have an active booking');
      }
      yield notify.sendTextMessage(user, message.join('. ') + '.');
      yield notify.slack({ text : `${ user.link() } sent "${ opts.raw }" and the computer sent the account info.` }, { channel : '#app_support' });
      return true;
    }

    if(!currentBooking) {
      if (['unlock','lock','rebook'].includes(command)) {
        previousBooking = yield Booking.findOne({ 
          where : { 
            status : {
              in : [ 'completed', 'ended', 'cancelled' ]
            },
            userId : user.id 
          },
          include: [ 
            {
              model: 'BookingDetails',
              as: 'details',
            },
            {
              model: 'Car',
              as: 'car',
            }
          ],
          order: [[ 'id', 'desc' ]]
        });

        if(command === 'rebook') {
          let params;
          try {
            yield booking.create({
              userId: user.id,
              carId: previousBooking.carId
            }, user);
            yield notify.sendTextMessage(user, `Rebooked ${ previousBooking.car.license } for free.` );
            return true;
          } catch (ex) {
            if(ex.options && ex.options[0]) {
              params = JSON.parse(ex.options[0].action.params);
            }
          }
          if(!params) {
            yield notify.sendTextMessage(user, `Sorry, someone beat you to ${ previousBooking.car.license }. :-(.` );
            return true;
          }
          try {
            yield booking.create(params, user);
            yield notify.slack({ text : `:selfie:${ user.link() } sent "${ opts.raw }" and the computer rebooked` }, { channel : '#reservations' });
            yield notify.sendTextMessage(user, `Rebooked ${ previousBooking.car.license } for $${params.opts.buyNow}.` );
          } catch(ex){
            yield notify.sendTextMessage(user, `Unable to rebook ${ previousBooking.car.license }, please try again.` );
          }
          return true;
        }

        // one user sent us this:
        //
        // Subject: Locked stuff in car
        //
        // Which normally would be lock ... so what we do instead is look to see if they've started to retrieve and if they haven't then we
        // attempt to inverse the functionality ...
        //
        if(
            (command === 'unlock' || (command === 'lock' && !previousBooking.isFlagged('retrieveStart'))) && 
            new Date() - previousBooking.getEndTime() < 1000 * 60 * 5) {
          yield previousBooking.flag('retrieveStart');
          yield notify.slack({ text : `:rowboat:${user.link()} is retrieving something from ${previousBooking.car.link()}` }, { channel : '#rental-alerts' });
          yield cars.unlockCar(previousBooking.carId, user, previousBooking.car, {overrideAdminCheck: true});
          yield notify.sendTextMessage(user, `${previousBooking.car.license} is unlocked for you to retrieve your belongings. Important: Please reply with 'lock' to secure the vehicle when finished.`); 
          return true;
        }
        // We give them a longer amount of time to secure the car since it doesn't open up a new hole.
        if(command === 'lock' && new Date() - previousBooking.getEndTime() < 1000 * 60 * 18) {
          yield previousBooking.flag('retrieveEnd');
          yield notify.slack({ text : `:desert_island:${user.link()} finished and secured ${previousBooking.car.link()}` }, { channel : '#rental-alerts' });
          yield cars.lockCar(previousBooking.carId, user, previousBooking.car, {overrideAdminCheck: true});                                                                 
          yield notify.sendTextMessage(user, `Thanks.`); 
          return true;
        }
      }

      // if we guessed their intention but couldn't figure it out, then we don't give them a cryptic message
      if(!guessed) {
        yield notify.sendTextMessage(user, "You don't have a current booking. Command not understood");
        return true;
      }
      return false;
    }
    let id = currentBooking.id;

    let response;
    if (command === 'finish' || command === 'complete') {
      command = 'finish';
      try {
        yield booking.end(id, user);
      } catch(ex) {
        success = false;
        response = yield this.returnError(user, ex, command);
      }
      try {
        yield booking.complete(id, user);
      } catch(ex) {
        success = false;
        response = yield this.returnError(user, ex, command);
      }
    }

    try {
      if(command === 'start') {
        yield booking.ready(id, user);
      } else if (command === 'save less' || command === 'less' || command === 'save') {
        command = 'extend';
        yield booking._extend(id, {howmuch: -1}, user);
      } else if (command === 'cancel' || command === 'abort') {
        command = 'cancel';
        yield booking.cancel(id, user);
      } else if (command === 'access') {
        yield cars.accessCar(currentBooking.carId, user);
      } else if (command === 'unlock') {
        yield cars.unlockCar(currentBooking.carId, user);
      } else if (command === 'lock') {
        yield cars.lockCar(currentBooking.carId, user);
      }
    } catch(ex) {
      console.log(ex);
      success = false;
      response = yield this.returnError(user, ex, command);
    }

    let message = success ? `and the computer ${ command }ed` : `but the computer *failed* to ${ command }! We sent "${response}"`;
      
    yield notify.slack({ text : `:selfie: ${ user.link() } sent "${ opts.raw }" ${ message }` }, { channel : '#reservations' });
    
    if(!success || sendToSupport) {
      yield notify.slack({ text : `${ user.link() } sent "${ opts.raw }" ${ message }` }, { channel : '#app_support' });
    }

    return true;
  },

  *deliverSms(payload) {
    let params = url.parse(payload, true);
    let smstext = params.query.Body.trim().toLowerCase();
    let phone = params.query.From;
    let user = yield User.findOne({ where : { phone: phone } });
    let who = user ? user.link() : '_unknown_';
    let ts = moment.tz(moment.utc(), "America/Los_Angeles").format('YYYY/MM/DD HH:mm:ss');
    fs.appendFile('/var/log/outgoing/sms.txt', `${ts} ${phone} ${who}: ${ params.query.Body }\n`, function(){});

    // We need to be open to the possibility of people texting us which
    // have not registered. In these cases we pass everything through.
    if(user && (yield this.attemptAction(user, smstext, {raw: params.query.Body, phone: phone}))) {
      return true;
    }

    let message = `${ who } (${ phone }): ${ params.query.Body }`;
    yield notify.slack({ text : message }, { channel : '#app_support' });

    params.query.Body = params.query.Body;
    let aircall_url = 'https://webhook.frontapp.com/sms/18f55053c49e4d3d27bbc4af0e7d78e97205c88981d8f954579682a382654912';

    let response = yield request({
      url     : aircall_url,
      method  : 'POST',
      form    : params.query
    });
    return response.body;
  }
  /*,

  *deliverMessageByEmail(payload, _user) {
    let email = new Email();

    yield email.send({
      to       : config.waivecar.contact.email,
      from     : _user.email,
      subject  : 'WaiveCar [Contact]',
      template : 'waivecar-contact',
      context  : {
        message : payload.message,
        subject : payload.subject,
        user    : _user
      }
    });
  }*/
};
