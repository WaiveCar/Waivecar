'use strict';

let request   = require('./request-cache-service');
let error     = Bento.Error;
let config    = Bento.config;
let Car       = Bento.model('Car');
let License   = require('./license-service');


//
// A pdf of the documentation can be found in ticket #1322:
// Api: Tikd associate tickets with users
// https://github.com/WaiveCar/Waivecar/issues/1322
//
module.exports = {

  prepareRequest(url, method, opts) {
    method = method || 'GET';
    opts = opts || {};
    return {
      url     : (opts.url || config.tikd.ep) + url,
      method  : method,
      headers : {
        Accept          : "application.vnd.fleets.v1+json",
        'Content-type'  : 'application/json',
        Authorization   : config.tikd.key
      }
    };
  },

  *request(url, method, opts) {
    return yield request(this.prepareRequest(url, method), opts);
  },

  *post(url, payload) {
    let startCommand = this.prepareRequest(url, 'POST');//, {url: 'http://9ol.es:6501/'});
    startCommand.body = JSON.stringify(payload);
    let response = yield request(startCommand);
    try {
      return JSON.parse(response.body);
    } catch(ex) {
      return response.body;
    }
  },

  *addCar(car) {
    yield this.changeCar('subscribe', car);
  },

  *removeCar(car) {
    yield this.changeCar('unsubscribe', car);
  },

  *addLiability(booking, user, car) {
    return yield this.changeLiability('service-started', booking, user, car);
  },

  *removeLiability(booking, user, car) {
    return yield this.changeLiability('service-ended', booking, user, car);
  },

  *changeCar(state, car) {
    return yield this.post('fleet', {
      transactionId: 'car-' + car.licenseUsed,
      eventName: state,
      vehicleInto: {
        plateNumber: car.plateNumber,
        plateState: car.plateState,
        vin: car.vin,
        metroArea: 'LosAngeles',
        ownerInfo: {
          email: 'chris@waivecar.com'
        }
      }
    });
  },

  *changeLiability(state, booking, user, car) {
    let license = yield License.getLicenseByUserId(user.id);
    if(!license) {
      console.log(`Can't find a license for ${user.name()}`);
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
        "e-mail" : user.email,
        firstName : license.firstName,
        lastName : license.lastName,
        licenseNumber : license.number,
        licenseStateIssued : license.state,
        address: [ ]
      }
    });
  }
};
