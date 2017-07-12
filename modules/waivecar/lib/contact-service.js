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


module.exports = {
  *deliverMessage(payload, _user) {
    yield notify.slack({ text : `From: ${ _user.name() } ${ _user.email } ${ _user.info() }\n Subject: ${ payload.subject || '_(none)_' }\n${ payload.message || '_(none)_' }` }, { channel : '#app_support' });
  },

  *attemptAction(user, command) {
    // we try the complex book command first.
    let bookCmd = command.match(/^book\s(\w+)$/i);

    if(bookCmd) {
      let license = bookCmd[1];
      let requestedCar = yield Car.findOne({
        where: {
          license: {
            $like: `%${ license }%`
          }
        }
      });
      if(requestedCar) {
        try {
          yield booking.create({
            userId: user.id,
            carId: requestedCar.id,
          }, user);
        } catch(ex) {
          if(ex.message) {
            yield notify.sendTextMessage(user, ex.message);
          }
        }
      } else {
        yield notify.sendTextMessage(user, `Unable to book ${license}. Check your spelling.`);
      }
      return true;
    }

    // now we can do the simple ones.
    if(['commands','available','start','finish','complete','cancel','unlock','lock'].indexOf(command) === -1) {
      return false;
    }

    if(command === 'commands') {
      let help = [
        "Available commands:",
        " available - list available WaiveCars",
        " book <car name> - book a WaiveCar. Example:",
        "   book waive14",
        " cancel - cancel your booking",
        " start - start your booking",
        " finish - complete your booking",
        " lock - lock the WaiveCar",
        " unlock - unlock the WaiveCar",
        "All other messages sent to this number pass thru to WaiveCar's support staff."
      ];
      yield notify.sendTextMessage(user, help.join('\n'));
      return true;
    }

    if(command === 'available') {
      let carList = yield Car.find({where: {
          isWaivework: false,
          isAvailable: true
        }
      });
      let message = yield carList.map(function *(car) {
        return car.license + " " + (yield booking.getAddress(car.latitude, car.longitude));
      });
      yield notify.sendTextMessage(user, "Currently available WaiveCars:\n" + message.join('\n\n') + "\nType 'commands' for help.");
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

    if(!currentBooking) {
      yield notify.sendTextMessage(user, "You don't have a current booking. Command not understood");
      return true;
    }
    let id = currentBooking.id;

    if (command === 'finish' || command === 'complete') {
      try {
        yield booking.end(id, user);
      } catch(ex) {
        if(ex.message) {
          yield notify.sendTextMessage(user, ex.message);
          console.log(ex.stack);
        }
      }
      try {
        yield booking.complete(id, user);
      } catch(ex) {
        if(ex.message) {
          yield notify.sendTextMessage(user, ex.message);
          console.log(ex.stack);
        }
      }
    }
    try {
      if(command === 'start') {
        yield booking.ready(id, user);
      } else if (command === 'cancel') {
        yield booking.cancel(id, user);
      } else if (command === 'unlock') {
        yield cars.lockCar(currentbooking.carId, user);
      } else if (command === 'lock') {
        yield cars.unlockCar(currentbooking.carId, user);
      }
    } catch(ex) {
    }

    return true;
  },

  *deliverSms(payload) {
    let params = url.parse(payload, true);
    let smstext = params.query.Body.trim().toLowerCase();
    let phone = params.query.From;
    let user = yield User.findOne({ where : { phone: phone } });

    if( !(yield this.attemptAction(user, smstext) ) ) {
      let who = user ? user.name() : '_unkonwn_';
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
