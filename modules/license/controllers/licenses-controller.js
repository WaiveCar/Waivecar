'use strict';

let service = require('../lib/license-service');

Reach.Register.Controller('LicensesController', function (controller) {

  /**
   * Stores a new license record.
   * @return {Object}
   */
  controller.store = function *() {
    return yield service.store(this.payload, this.auth.user);
  };

  /**
   * Returns a license index.
   * @return {Array}
   */
  controller.index = function *() {
    return yield service.index(this.query, this.auth.role, this.auth.user);
  };

  /**
   * Returns a single license record.
   * @param  {Mixed}  id
   * @return {Object}
   */
  controller.show = function *(id) {
    return yield service.show(id, this.auth.user);
  };

  /**
   * Updates a single license based on the provided id.
   * @param  {Mixed}  id
   * @return {Object}
   */
  controller.update = function *(id) {
    return yield service.update(id, this.payload, this.auth.user);
  };

  /**
   * Deletes a license record.
   * @param  {Mixed}  id
   * @return {Object}
   */
  controller.delete = function *(id) {
    return yield service.delete(id, this.auth.user);
  };

  return controller;

});