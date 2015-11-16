'use strict';

let service = require('../lib/verification-service');

Bento.Register.Controller('LicenseVerificationsController', function (controller) {

  /**
   * Requests a new verification and updates license to pending.
   * @return {Object}
   */
  controller.store = function *(id) {
    return yield service.store(id, this.payload, this.auth.user);
  };

  controller.show = function *(id) {
    return yield service.show(id, this.payload, this.auth.user);
  };

  return controller;

});
