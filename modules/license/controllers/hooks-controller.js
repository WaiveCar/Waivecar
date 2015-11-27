'use strict';

let hooks = require('../lib/hook-service');

Bento.Register.Controller('LicenseHooksController', function(controller) {

  /**
   * Catches an inbound hook event.
   * @param {String} service
   */
  controller.catch = function *() {
    return yield hooks.catch(this.payload);
  };

  return controller;

});
