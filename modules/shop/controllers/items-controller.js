'use strict';

let service = require('../lib/item-service');

Bento.Register.Controller('Shop/ItemsController', (controller) => {

  /**
   * Attempts to register a new item with the shop.
   * @return {Object}
   */
  controller.create = function *() {
    return yield service.create(this.payload, this.auth.user);
  };

  /**
   * Returns a index list of registered items.
   * @return {Array}
   */
  controller.index = function *() {
    return yield service.index(this.query, this.auth.user);
  };

  /**
   * Returns a shop item.
   * @param  {Number} id
   * @return {Object}
   */
  controller.show = function *(id) {
    return yield service.show(id, this.auth.user);
  };

  /**
   * Attempts to update a item in the shop.
   * @param  {Number} id
   * @return {Object}
   */
  controller.update = function *(id) {
    return yield service.update(id, this.payload, this.auth.user);
  };

  /**
   * Attempts to delete a item in the shop.
   * @param  {Number} id
   * @return {Object}
   */
  controller.delete = function *(id) {
    return yield service.delete(id, this.auth.user);
  };

  return controller;

});
