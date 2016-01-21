'use strict';

let service = require('../lib/cart-service');
let error   = Bento.Error;

Bento.Register.Controller('Shop/CartsController', (controller) => {

  /**
   * Attempts to register a new item with the shop.
   * @return {Object}
   */
  controller.create = function *() {
    return yield service.create(this.payload, false, this.auth.user);
  };

  /**
   * Returns a index list of registered items.
   * @return {Array}
   */
  controller.index = function *() {
    if (!this.query.userId) {
      throw error.parse({
        code    : `SHOP_MISSING_USER_ID`,
        message : `The request is missing required 'userId' in query.`
      }, 400);
    }
    return yield service.index(this.query.userId, this.auth.user);
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
    return yield service.update(id, this.payload, false, this.auth.user);
  };

  /**
   * Saves the cart under the provided user.
   * @param  {Number} id
   * @return {Object}
   */
  controller.save = function *(id) {
    return yield service.save(id, this.auth.user);
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
