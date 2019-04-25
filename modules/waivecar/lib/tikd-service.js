'use strict';

let request   = require('co-request');
let error     = Bento.Error;
let config    = Bento.config;
let Car       = Bento.model('Car');
let fs        = require('fs');
let notify    = require('./notification-service');
let redis     = require('./redis-service');

//
// A pdf of the documentation can be found in ticket #1322:
// Api: Tikd associate tickets with users
// https://github.com/WaiveCar/Waivecar/issues/1322
//
module.exports = {

  *post(url, payload, opts) {
    if(process.env.NODE_ENV !== 'production') {
      return;
    }
    var response, responseJSON;

    var startCommand =  {
      url     : config.tikd.ep + url,
      method  : 'POST',
      body    : JSON.stringify(payload),
      headers : Object.assign({
        //'Authorization' : config.tikd.key,
        Accept          : "application.vnd.fleets.v1+json",
        'x-api-key'     : config.tikd.key
      }, opts)
    };

    try {
      response = yield request(startCommand);
      responseJSON = JSON.parse(response.body);

      // for debugging
      startCommand.body = payload;
      fs.appendFile('/var/log/outgoing/tikd.txt', JSON.stringify([url, response.body]) + "\n",function(){});
      return responseJSON;
    } catch(ex) {
      console.log(ex);
      if(response) {
        return response.body;
      }
    }
  },

  *hasAddress(user, license) {
    if(!license) {
      license = yield user.getLicense();
    }
    //
    // Make sure the following fields are non-null and not the empty-string
    // street2 is intentionally excluded.
    //
    return ['street1', 'city', 'state', 'zip'].reduce((val, row) => val && !!license[row], true);
  },

  *getFields(bookingId) {
    let Booking     = Bento.model('Booking');
    let User        = Bento.model('User');

    let res = { };
    res.booking = yield Booking.findById(bookingId);
    res.user = yield User.findById(res.booking.userId);

    return res;
  },

  *addCarIfNeeded(car) {
    if (!(yield car.hasTag('tikd'))) {
      console.log("adding " + car.license);
      let res = yield this.changeCar('subscribe', car);
      if(res) {
        yield notify.slack(
          { text: `:hatching_chick: Hurrah, ${ car.link() } is now registered with tikd.` },
          { channel: '#rental-alerts' }
        );
        yield car.addTag('tikd');
      } else {
        console.log('failure', res);
      }
      return res;
    }
    return true;
  },

  *removeCar(car) {
    yield this.changeCar('unsubscribe', car);
  },

  *addLiability(car, booking, user) {
    // There are bugs I (cjm) haven't been able to find in some bookings not
    // ending their previous liability. Ostensibly this should be a clean system
    // as far as I can tell but there's apparently a bug in it somewhere
    let hasLiability = yield redis.hget('tikd', car.license);

    if(hasLiability && hasLiability !== booking.id) {
      let oldData = yield this.getFields(hasLiability);
      yield this.removeLiability(car, oldData.booking, oldData.user);
    }

    if(booking.isFlagged('tikdStart')) {
      return true;
    }
    if (yield this.addCarIfNeeded(car)) {
      let res = yield this.changeLiability('service-started', car, booking, user);
      console.log(res);
      if(!res) {
        console.log(`Can't add liability for booking ${booking.id}`);
      } else {
        yield redis.hset('tikd', car.license, booking.id);
        yield booking.flag('tikdStart');
      }
      return res;
    }
  },

  *removeLiability(car, booking, user) {
    if(booking.isFlagged('tikdEnd') || !booking.isFlagged('tikdStart')) {
      return true;
    }

    let res = yield this.changeLiability('service-ended', car, booking, user);
    console.log(res);
    if(!res) {
      console.log(`Can't remove liability for booking ${booking.id}`);
    } else {
      yield redis.hdel('tikd', car.license);
      yield booking.flag('tikdEnd');
    }
    return res;
  },

  *changeCar(state, car) {
    if(car.vin && car.plateNumberWork && car.plateState) {
      let metroArea = 'LosAngeles';
      if(yield car.hasTag('level')) {
        metroArea = 'NewYorkCity';
      }
      return yield this.post('fleets', {
        transactionId: 'car-' + car.license,
        eventName: state,
        vehicleInfo: {
          plateNumber: car.plateNumberWork,
          plateState: car.plateState,
          vin: car.vin,
          metroArea: metroArea,
          ownerInfo: {
            email: 'chris@waivecar.com'
          }
        },
        metaData: {
          partnerCarId: car.license
        }
      }, { Accept : 'application.vnd.fleets.v1+json' });
    } else {
      let missing = [];
      if (!car.plateNumberWork) {
        missing.push('license plate number');
      }
      if(!car.vin) {
        missing.push('vin number');
      }
      if(!car.plateState) {
        missing.push('license plate state');
      }
      yield notify.slack(
        { text: `:beers: A booking with ${ car.link() } started which CANNOT be added to tikd because the following is missing: ${ missing.join(', ') }` },
        { channel: '#rental-alerts' },
      );
    }
  },

  *changeLiability(state, car, booking, user) {
    let license = yield user.getLicense();
    if(!license) {
      yield notify.slack(
        { text: `:genie: ${ user.link() } does not have a license on file. Booking ${ booking.link() } cannot be added to tikd` },
        { channel: '#rental-alerts' },
      );
      return;
    }

    let missing = ['street1', 'city', 'state', 'zip'].filter(row => !license[row]).join(', ');
    if(missing) {
      yield notify.slack(
        { text: `:genie: ${ user.link() } is missing the following fields in their license: ${missing}. Booking ${ booking.link() } cannot be added to tikd.` },
        { channel: '#rental-alerts' },
      );
      return;
    }

    let plateNumber = car.plateNumber || car.plateNumberWork;
    if(!plateNumber) {
      let newCar = yield Car.findById(car.id);
      plateNumber = newCar.plateNumber;

      if(!plateNumber) {
        yield notify.slack(
          { text: `:beers: A booking with ${ car.link() } started which CANNOT be ended in tikd because some plate number issue. Chris should probably fix this.` },
          { channel: '#rental-alerts' },
        );
      }
    }
    return yield this.post('renters', {
      rentalId : "booking-" + booking.id,
      eventName : state,
      transactionDate : new Date().toISOString(),
      rentalVehicle : {
        plateNumber : car.plateNumber,
        plateState : car.plateState
      },
      renterInfo : {
        email : user.email,
        firstName : license.firstName,
        lastName : license.lastName,
        licenseNumber : license.number,
        licenseStateIssued : license.state,
        address: {
          street1: license.street1,
          street2: license.street2,
          city: license.city,
          state: license.state,
          zip: license.zip
        }
      }
    }, { Accept : 'application.vnd.renters.v1+json' });
  }
};
