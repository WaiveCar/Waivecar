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
    /*
    if(process.env.NODE_ENV !== 'production') {
      console.log([url,payload]);
      return true;
    }
    */
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
      if('error' in responseJSON) {
        throw error.parse({message: responseJSON.error}, 400);
        return false;
      }
      fs.appendFile('/var/log/outgoing/tikd.txt', JSON.stringify([new Date(), url, payload, responseJSON]) + "\n",function(){});

      return responseJSON;
    } catch(ex) {
      fs.appendFile('/var/log/outgoing/tikd.txt', JSON.stringify([new Date(), url, payload, ex, response]) + "\n",function(){});
      throw ex;
      return false;
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
/*
  *fakeAdd(what, which) {
    let 
      state = which,
      car = {
        license: '234',
        plateNumberWork: '1ABC1243',
        state: 'CA',
        plateState: 'CA',
        metroArea: 'LosAngeles',
        vin: 'KMHC75LH3JU023611',
      },
      license = {
        email: 'kristopolous@yahoo.com',
        firstName: "Chris",
        lastName: "McKenzie",
        licenseNumber: 'B9633859',
        licenseStateIssued: 'CA',
        address: {
          street1: '3344 Mentone Ave #2',
          street2: '',
          zip: '90034',
          state: 'CA',
        }
      },
      user = {
        email: 'kristopolous@yahoo.com',
        stripeId: '123',
      },
      booking = {
        getEndTime: () => {}
      };

    if(what == 'car') {

      return yield this.post('fleets', {
        transactionId: 'car-' + car.license,
        eventName: state,
        serviceType: "streaming",
        vehicleInfo: {
          plateNumber: car.plateNumberWork,
          plateState: car.plateState,
          vin: car.vin,
          metroArea: car.metroArea,
          ownerInfo: {
            email: 'chris@waivecar.com'
          }
        },
        metaData: {
          partnerCarId: car.license
        }
      }, { Accept : 'application.vnd.fleets.v1+json' });
    } else if (what == 'person') {

      return yield this.post('renters', {
        rentalId : "booking-" + booking.id,
        eventName : state,
        transactionDate : booking.getEndTime() || new Date().toISOString(),
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
        },
        metaData: {
          partnerStripeId: user.stripeId,
        }
      }, { Accept : 'application.vnd.renters.v1+json' });
    }
  },
*/
  *addCarIfNeeded(car, isUpdate) {
    var res;
    if (isUpdate || !(yield car.hasTag('tikd'))) {
      console.log("adding " + car.license);
      try {
        res = yield this.changeCar('subscribe', car);
        if(res) {
          yield notify.slack(
            { text: `:hatching_chick: Hurrah, ${ car.link() } is now registered with tikd.` },
            { channel: '#rental-alerts' }
          );
          yield car.addTag('tikd');
        } else {
          console.log('failure', res);
        }
      } catch(ex) {
        if('message' in ex && ex.message.indexOf('already registered') !== -1) {
          // add it if tikd says we already have it.
          yield car.addTag('tikd');
        }
        console.log(ex);
      }
      return res;
    }
    return true;
  },

  *addLiabilityByBookingId(bookingId, force) {
    let Booking     = Bento.model('Booking');
    let booking = yield Booking.findById(bookingId);
    let car = yield booking.getCar();
    let user = yield booking.getUser();
    if (!force) {
      return yield this.addLiability(car, booking);
    } 
    return yield this.changeLiability('service-started', car, booking, user);
  },

  *removeLiabilityByBookingId(bookingId, force) {
    let Booking     = Bento.model('Booking');
    let booking = yield Booking.findById(bookingId);
    let car = yield booking.getCar();
    let user = yield booking.getUser();
    if (!force) {
      return yield this.removeLiability(car, booking, user);
    }
    return yield this.changeLiability('service-ended', car, booking, user);
  },

  *addCarById(carId) {
    let car = yield Car.findById(carId);
    if (car) {
      return yield this.addCarIfNeeded(car, true);
    }
  },

  *removeCarById(carId) {
    let car = yield Car.findById(carId);
    if (car) {
      return yield this.removeCar(car);
    }
  },

  *removeCar(car) {
    if (yield car.hasTag('tikd')) {
      if (yield this.changeCar('unsubscribe', car)) {
        yield car.delTag('tikd');
        return true;
      } else {
        throw error.parse({
          message : `Car ${car.license} is flagged as being on tikd, but we failed anyway!`
        }, 400);
      }
    } else {
      throw error.parse({
        message : `Car ${car.license} is not flagged as being on tikd!`
      }, 400);
    }
  },

  *addLiability(car, booking) {
    // There are bugs I (cjm) haven't been able to find in some bookings not
    // ending their previous liability. Ostensibly this should be a clean system
    // as far as I can tell but there's apparently a bug in it somewhere
    let hasLiability = yield redis.hget('tikd', car.license);
    let user = yield booking.getUser();

    if(hasLiability && hasLiability !== booking.id) {
      let oldData = yield this.getFields(hasLiability);
      yield this.removeLiability(car, oldData.booking, oldData.user);
    }

    if(booking.isFlagged('tikdStart')) {
      return true;
    }
    if (yield this.addCarIfNeeded(car)) {
      let res = yield this.changeLiability('service-started', car, booking, user);
      if(!res) {
        console.log(`Can't add liability for booking ${booking.id}`);
      } else {
        yield redis.hset('tikd', car.license, booking.id);
        yield booking.flag('tikdStart');
      }
      return res;
    }
  },

  *removeLiability(car, booking, user, noslack) {
    if(booking.isFlagged('tikdEnd')) {
      return true;
    }
    user = yield booking.getUser();

    let res = yield this.changeLiability('service-ended', car, booking, user, noslack);
    if(!res) {
      yield booking.flag('tikdFailedEnd');
      console.log(`Can't remove liability for booking ${booking.id}`);
    } else {
      yield redis.hdel('tikd', car.license);
      yield booking.flag('tikdEnd');
    }
    return res;
  },

  *changeCar(state, car) {
    let plate = car.plateNumber || car.plateNumberWork;
    if(car.vin && plate && car.plateState) {
      let metroArea = 'LosAngeles';
      if(yield car.hasTag('level')) {
        metroArea = 'NewYorkCity';
      }
      return yield this.post('fleets', {
        transactionId: 'car-' + car.license,
        eventName: state,
        serviceType: "streaming",
        vehicleInfo: {
          plateNumber: plate,
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
      if (!plate) {
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
      return false;
    }
  },

  *changeLiability(state, car, booking, user, noslack) {
    let license = yield user.getLicense(), 
        verb = state === 'service-started' ? 'added': 'ended',
        err = '';

    if(!license) {
      err = `${ user.link() } does not have a license on file. ${ booking.link() } cannot be ${verb} to tikd`;
    } else {
      let missing = ['street1', 'city', 'state', 'zip'].filter(row => !license[row]).join(', ');
      if(missing) {
        err += `${ user.link() } is missing the following fields in their license: ${missing}. ${ booking.link() } cannot be ${verb} to tikd.`;
      }
    }

    let plateNumber = car.plateNumber || car.plateNumberWork;
    if(!plateNumber) {
      let newCar = yield Car.findById(car.id);
      plateNumber = newCar.plateNumber;

      if(!plateNumber) {
        err += `A booking with ${ car.link() } started which CANNOT be ended in tikd because some plate number issue. Chris should probably fix this.`;
      }
    }

    if(err) {
      if(!noslack) {
        yield notify.slack(
          { text: `:genie: ${ err } ` },
          { channel: '#rental-alerts' },
        );
      }
      return;
    }

    return yield this.post('renters', {
      rentalId : "booking-" + booking.id,
      eventName : state,
      transactionDate : booking.getEndTime() || new Date().toISOString(),
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
      },
      metaData: {
        partnerStripeId: user.stripeId,
      }
    }, { Accept : 'application.vnd.renters.v1+json' });
  }
};
