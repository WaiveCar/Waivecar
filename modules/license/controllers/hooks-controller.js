'use strict';

let hooks = require('../lib/hook-service');

Bento.Register.Controller('LicenseHooksController', function(controller) {

  /**
   * Catches an inbound hook event.
   * @param {String} service
   */
  controller.catch = function *(service) {
    return yield hooks.catch(service, this.payload);
  };

  return controller;

});
