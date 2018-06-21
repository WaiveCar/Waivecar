'use strict';

let car   = require('../lib/car-service');
let error = Bento.Error;

Bento.Register.Controller('CarsController', function(controller) {

  controller.index = function *() {
    return yield car.index(this.query, this.auth.user);
  };

  controller.carsWithBookings = function *() {
    return yield car.carsWithBookings(this.auth.user);
  };

  controller.bookings = function *(id) {
    return yield car.bookings(this.query, id, this.auth.user);
  };

  controller.show = function *(id) {
    return yield car.show(id, this.auth.user);
  };

  /**
   * Updates the provided user.
   * @param  {Number} id
   * @return {Object}
   */
  controller.update = function *(id) {
    return yield car.update(id, this.payload, this.auth.user);
  };

  controller.magic = function *(command) {
    let Car = Bento.model('Car');
    let close = yield car.closest(this.query.longitude, this.query.latitude);
    let carList = close.res;
    let all = yield Car.find();

    if(carList.length === 1 && distance < 400) {
      let res = yield controller.command.call(this, carList[0].id, command);
      return {
        car: carList,
        distance: close.distance,
        all: all,
        status: res
      };
    } 

    return { 
      candidates: carList,
      all: all,
      distance: close.distance
    };
  };


  /**
   * Execute a command on a single car.
   * @param  {Number} id The Car Id.
   * @param  {String} command lock/unlock.
   * @return {Object}
   */
  controller.command = function *(id, command) {
    switch (command) {
      case 'ble'                : return yield car.ble(id, this.auth.user);
      case 'lock'               : return yield car.lockCar(id, this.auth.user);
      case 'unlock'             : return yield car.unlockCar(id, this.auth.user);
      case 'horn'               : return yield car.horn(id, this.auth.user);
      case 'lock-immobilizer'   : return yield car.lockImmobilzer(id, this.auth.user);
      case 'unlock-immobilizer' : return yield car.unlockImmobilzer(id, this.auth.user);
      case 'refresh'            : return yield car.refresh(id, this.auth.user);
      case 'available'          : return yield car.updateAvailability(id, true, this.auth.user);
      case 'unavailable'        : return yield car.updateAvailability(id, false, this.auth.user);
      case 'repair'             : return yield car.updateRepair(id, this.auth.user);
      case 'visible'            : return yield car.updateVisibility(id, true, this.auth.user);
      case 'hidden'             : return yield car.updateVisibility(id, false, this.auth.user);
      case 'retrieve'           : return yield car.retrieve(id, this.auth.user);
      case 'rentable'           : return yield car.rentable(id, this.auth.user);

      default                   : {
        throw error.parse({
          code    : `CAR_UNRECOGNIZED_COMMAND`,
          message : `The '${command}' is not supported/recognized.`
        }, 400);
      }
    }
  };

  controller.events = function *(id) {
    return yield car.events(id, this.auth.user);
  };

  //
  // This is really to address https://github.com/clevertech/Waivecar/issues/577
  // The problem was that the server didn't crash but it wasn't servicing requests
  // like expected. The "best" way to look for that, in my opinion would be to
  // put a dummy route in the same place as everything else that doesn't do much.
  //
  // Eventually with load-balancing something like this will be put elsewhere but 
  // for now this is a fine place - especially since we are tackling a separate and 
  // distinct issue.
  //
  controller.ping = function *() {
    return yield car.ping();
  };

  return controller;

});
