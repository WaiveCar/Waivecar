'use strict';

let car   = require('../lib/car-service');
let error = Bento.Error;

Bento.Register.Controller('CarsController', function(controller) {

  /**
   * Returns a list of cars.
   * @return {Object}
   */
  controller.index = function *() {
    return yield car.index(this.query, this.auth.user);
  };

  /**
   * Returns a single car.
   * @param  {Number} id The Car Id.
   * @return {Object}
   */
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

  /**
   * Execute a command on a single car.
   * @param  {Number} id The Car Id.
   * @param  {String} command lock/unlock.
   * @return {Object}
   */
  controller.command = function *(id, command) {
    switch (command) {
      case 'lock'               : return yield car.lockCar(id, this.auth.user);
      case 'unlock'             : return yield car.unlockCar(id, this.auth.user);
      case 'lock-immobilizer'   : return yield car.lockImmobilzer(id, this.auth.user);
      case 'unlock-immobilizer' : return yield car.unlockImmobilzer(id, this.auth.user);
      case 'refresh'            : return yield car.refresh(id, this.auth.user);
      case 'available'          : return yield car.updateAvailability(id, true, this.auth.user);
      case 'unavailable'        : return yield car.updateAvailability(id, false, this.auth.user);
      case 'visible'            : return yield car.updateVisibility(id, true, this.auth.user);
      case 'hidden'             : return yield car.updateVisibility(id, false, this.auth.user);
      default                   : {
        throw error.parse({
          code    : `CAR_UNRECOGNIZED_COMMAND`,
          message : `The '${command}' is not supported/recognized.`
        }, 400);
      }
    }
  };

  /**
   * Retrieve all events for a single car.
   * @param  {Number} id The Car Id.
   * @return {Object}
   */
  controller.events = function *(id) {
    return yield car.events(id, this.auth.user);
  };

  return controller;

});
