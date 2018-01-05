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


module.exports = {
  *deliverMessage(payload, _user) {
    yield notify.slack({ text : `From: ${ _user.name() } ${ _user.email } ${ _user.info() }\n Subject: ${ payload.subject || '_(none)_' }\n${ payload.message || '_(none)_' }` }, { channel : '#app_support' });
  },

  
  *returnError(user, err) {
    if(err.message) {
      let message = err.message.replace(/<br>/g, '\n');
      message = message.replace(/<[^>]*>/g, '');
      yield notify.sendTextMessage(user, message);
    }
  },

  *attemptAction(user, command) {
    // we try the complex book command first.
    let argCmd = command.match(/^(book|details)\s(\w+|\w+\s\d+)$/i);

    if(argCmd) {
      let license = argCmd[2].replace(/\s/g, '');
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
          if(argCmd[1] === 'book') {
            yield booking.create({
              userId: user.id,
              carId: requestedCar.id
            }, user);
          } else if(argCmd[1] === 'details') {
            yield notify.sendTextMessage(user, `${requestedCar.license} is available. It's at ${requestedCar.charge}%. It's current GPS coordinates are https://maps.google.com/?q=${requestedCar.latitude},${requestedCar.longitude}`);
          }
        } catch(ex) {
          yield this.returnError(user, ex);
        }
      } else {
        yield notify.sendTextMessage(user, `Unable to access ${license}. Check your spelling.`);
      }
      return true;
    }


    // alias commands are blank.
    let documentation = {
      available: "List available WaiveCars",
      book: "Book a WaiveCar. Example:\n   book waive14",
      commands: null,
      save: "Add 10 additional minutes to get to a WaiveCar reservation for $1.00",
      abort: "Cancel your booking",
      cancel: null,
      start: "Start your ride",
      finish: "Finish your ride",
      complete: null,
      notify: null,
      lock: "Lock the WaiveCar",
      unlock: "Unlock the WaiveCar",
      account: "Information about your account",
    };

    // now we can do the simple ones.
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
      let footer = "\nType 'commands' for help.";
      let carList = yield Car.find({where: {
          isWaivework: false,
          isAvailable: true
        }
      });
      
      if(carList.length === 0) {
        yield notify.sendTextMessage(user, "There are no WaiveCars available. :(" + footer);
      } else {
        let message = yield carList.map(function *(car) {
          return car.license + " (" + car.charge + "%) " + (yield booking.getAddress(car.latitude, car.longitude));
        });
        yield notify.sendTextMessage(user, "Available WaiveCars:\n" + message.join('\n') + "\n" + footer);
      }
     
      return true;
    }

    let currentBooking = yield Booking.findOne({ 
      where : { 
        status : {
          $notIn : [ 'completed', 'closed', 'ended', 'cancelled' ]
        },
        userId : user.id 
      }
    });

    // account may or may not have a current booking if one does or
    // does not exist. So the place that it is processed is important.
    if(command === 'account') {
      let message = [`Hi, ${user.name()}`];

      if(user.credit !== 0) {
        let money = Math.abs(user.credit)/100;

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
        let second = mStart.format('s');
        let car = yield Car.findById(currentBooking.carId);
        let address = yield booking.getAddress(car.latitude, car.longitude);
        if(address) {
          address = ', located at ' + address;
        }

        message.push(`Your booking with ${ car.license }, ${ car.averageCharge() }% charged${address} is ${ currentBooking.status } as of ${hour}${minute}m${second}s ago`);
      } else {
        message.push('You do not have an active booking');
      }
      yield notify.sendTextMessage(user, message.join('. ') + '.');
      return true;
    }

    if(!currentBooking) {
      yield notify.sendTextMessage(user, "You don't have a current booking. Command not understood");
      return true;
    }
    let id = currentBooking.id;

    if (command === 'finish' || command === 'complete') {
      try {
        yield booking.end(id, user);
      } catch(ex) {
        yield this.returnError(user, ex);
        console.log(ex.stack);
      }
      try {
        yield booking.complete(id, user);
      } catch(ex) {
        yield this.returnError(user, ex);
        console.log(ex.stack);
      }
    }

    try {
      if(command === 'start') {
        yield booking.ready(id, user);
      } else if (command === 'save') {
        yield booking.extend(id);
      } else if (command === 'cancel' || command === 'abort') {
        yield booking.cancel(id, user);
      } else if (command === 'unlock') {
        yield cars.unlockCar(currentBooking.carId, user);
      } else if (command === 'lock') {
        yield cars.lockCar(currentBooking.carId, user);
      }
    } catch(ex) {
      yield this.returnError(user, ex);
    }

    return true;
  },

  *deliverSms(payload) {
    let params = url.parse(payload, true);
    let smstext = params.query.Body.trim().toLowerCase();
    let phone = params.query.From;
    let user = yield User.findOne({ where : { phone: phone } });
    let who = user ? user.name() : '_unknown_';
    let ts = moment.tz(moment.utc(), "America/Los_Angeles").format('YYYY/MM/DD HH:mm:ss');
    fs.appendFileSync('/var/log/outgoing/sms.txt', `${ts} ${phone} ${who}: ${ params.query.Body }\n`);

    // We need to be open to the possibility of people texting us which
    // have not registered. In these cases we pass everything through.
    if(user && (yield this.attemptAction(user, smstext))) {
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
