'use strict';

let LicenseService = require('../lib/license-service');

Reach.Register.Controller('LicensesController', function (controller) {

  /**
   * @method create
   * @param  {Object} post
   * @return {Void}
   */
  controller.create = function *(post) {
    return yield LicenseService.create(post, this.auth.user);
  };

  /**
   * @method index
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
   * @method update
   * @param  {Mixed}  id
   * @param  {Object} data
   * @return {Void}
   */
  controller.update = function *(id, data) {
    return yield LicenseService.save(id, this.auth.user, data);
  };

  /**
   * @method destroy
   * @param  {Mixed}  id
   * @param  {Object} data
   * @return {Void}
   */
  controller.destroy = function *(id, data) {
    return yield LicenseService.destroy(id, this.auth.user, data);
  };

  return controller;

});