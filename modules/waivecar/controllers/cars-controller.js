'use strict';

let car = require('../lib/car-service');

Bento.Register.Controller('CarsController', function(controller) {

  /**
   * Returns a list of cars.
   * @return {Object}
   */
  controller.index = function *() {
    return yield car.index(this.query, this.auth.role, this.auth.user);
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
    return yield car.executeCommand(id, command, this.auth.user);
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
