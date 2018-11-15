'use strict';

let request   = require('./request-cache-service');
let error     = Bento.Error;
let config    = Bento.config;
let Car       = Bento.model('Car');
let License   = require('../../license/lib/license-service');


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
        'x-api-key'     : config.tikd.key
      }
    };
  },

  *request(url, method, opts) {
    try {
      return yield request(this.prepareRequest(url, method), opts);
    } catch (ex) { }
  },

  *post(url, payload) {
    let startCommand = this.prepareRequest(url, 'POST');//, {url: 'http://9ol.es:6501/'});
    startCommand.body = JSON.stringify(payload);
    var response;
    try {
      response = yield request(startCommand);
      return JSON.parse(response.body);
    } catch(ex) {
      if(response) {
        return response.body;
      }
    }
  },

  *addCarIfNeeded(car) {
    if (!(yield car.hasTag('tikd'))) {
      console.log("adding " + car.license);
      let res = yield this.changeCar('subscribe', car);
      if(res) {
        yield car.addTag('tikd');
      }
      return res;
    }
    return true;
  },

  *removeCar(car) {
    yield this.changeCar('unsubscribe', car);
  },

  *addLiability(car, booking, user) {
    if(booking.isFlagged('tikdStart')) {
      return true;
    }
    if (yield this.addCarIfNeeded(car)) {
      let res = yield this.changeLiability('service-started', car, booking, user);
      if(!res) {
        console.log(`Can't add liability for booking ${booking.id}`);
      } else {
        yield booking.flag('tikdStart');
      }
      return res;
    }
  },

  *removeLiability(car, booking, user) {
    if(booking.isFlagged('tikdEnd')) {
      return true;
    }
    let res = yield this.changeLiability('service-ended', car, booking, user);
    if(!res) {
      console.log(`Can't remove liability for booking ${booking.id}`);
    } else {
      yield booking.flag('tikdEnd');
    }
    return res;
  },

  *changeCar(state, car) {
    if(car.vin && car.plateNumber && car.plateState) {
      let metroArea = 'LosAngeles';
      if(yield car.hasTag('level')) {
        metroArea = 'NewYorkCity';
      }
      return yield this.post('fleet', {
        transactionId: 'car-' + car.licenseUsed,
        eventName: state,
        vehicleInto: {
          plateNumber: car.plateNumber,
          plateState: car.plateState,
          vin: car.vin,
          metroArea: metroArea,
          ownerInfo: {
            email: 'chris@waivecar.com'
          }
        }
      });
    } else {
      console.log(`${car.license} is missing something: vin(${car.vin}) license(${car.plateNumber}) state(${car.plateState})`);
    }
  },

  *changeLiability(state, car, booking, user) {
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
