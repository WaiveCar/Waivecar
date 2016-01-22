'use strict';

let Service = require('../lib/view-service');

Bento.Register.Controller('ViewsController', (controller) => {

  /**
   * @return {Object}
   */
  controller.store = function *() {
    return yield Service.create(this.payload, this.auth.user);
  };

  /**
   * @return {Array}
   */
  controller.index = function *() {
    return yield Service.getAll(this.auth.user);
  };

  /**
   * @param  {Mixed}  id
   * @return {Object}
   */
  controller.show = function *(id) {
    return yield Service.get(id, this.auth.user);
  };

  /**
   * @param  {Mixed} id
   * @return {Object}
   */
  controller.update = function *(id) {
    return yield Service.update(id, this.payload, this.auth.user);
  };

  /**
   * @param  {Mixed} id
   * @return {Object}
   */
  controller.destroy = function *(id) {
    return yield Service.destroy(id, this.auth.user);
  };

  return controller;

});
