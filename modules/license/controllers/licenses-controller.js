'use strict';

let LicenseService = require('../lib/license-service');

Reach.Register.Controller('LicensesController', function (controller) {

  /**
   * @return {Void}
   */
  controller.store = function *() {
    return yield LicenseService.create(this.payload, this.auth.user);
  };

  /**
   * @return {Void}
   */
  controller.index = function *() {
    return yield LicenseService.getAll(this.auth.user);
  };

  /**
   * @method show
   * @param  {Mixed}  id
   * @return {Void}
   */
  controller.show = function *(id) {
    return yield LicenseService.get(id, this.auth.user);
  };

  /**
   * @param  {Mixed}  id
   * @return {Void}
   */
  controller.update = function *(id) {
    return yield LicenseService.update(id, this.auth.user, this.payload);
  };

  /**
   * @param  {Mixed}  id
   * @return {Void}
   */
  controller.destroy = function *(id, data) {
    return yield LicenseService.destroy(id, this.auth.user, this.payload);
  };

  return controller;

});