'use strict';

let hooks = require('../lib/hooks-service');

Bento.Register.Controller('Shop/HooksController', (controller) => {

  /**
   * Catches an inbound hook event.
   * @param {String} service
   */
  controller.catch = function *(service) {
    return yield hooks.catch(service, this.payload);
  };

  return controller;

});
