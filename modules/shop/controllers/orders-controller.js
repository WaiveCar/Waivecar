'use strict';

let service = require('../lib/order-service');

Bento.Register.Controller('Shop/OrdersController', (controller) => {

  controller.quickcharge = function *() {
    return yield service.quickCharge(this.payload, this.auth.user);
  };

  // Creates a new order.
  controller.create = function *() {
    return yield service.create(this.payload, this.auth.user);
  };

  /**
   * Authorizes an order for a set amount.
   * @return {Object}
   */
  controller.authorize = function *() {
    return yield service.authorize(this.payload, this.auth.user);
  };

  /**
   * Submits cart for authorized order.
   * @param  {Number} id
   * @return {Object}
   */
  controller.capture = function *(id) {
    return yield service.captures(id, this.payload, this.auth.user);
  };

  /**
   * Returns an indexed array of orders.
   * @return {Array}
   */
  controller.index = function *() {
    return yield service.index(this.query, this.auth.user);
  };

  /**
   * Returns a order object.
   * @param  {Number} id
   * @return {Object}
   */
  controller.show = function *(id) {
    return yield service.show(id, this.auth.user);
  };

  return controller;

});
