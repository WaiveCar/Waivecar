'use strict';

let car = require('../lib/car-service');

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
   * Execute a command on a single car.
   * @param  {Number} id The Car Id.
   * @param  {String} command lock/unlock.
   * @return {Object}
   */
  controller.update = function *(id, command) {
    switch (command) {
      case 'lock'               : return yield car.executeCommand(id, 'central_lock', 'lock', this.auth.user);
      case 'unlock'             : return yield car.executeCommand(id, 'central_lock', 'unlock', this.auth.user);
      case 'lock-immobilizer'   : return yield car.executeCommand(id, 'immobilizer', 'lock', this.auth.user);
      case 'unlock-immobilizer' : return yield car.executeCommand(id, 'immobilizer', 'unlock', this.auth.user);
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
