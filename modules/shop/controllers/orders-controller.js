'use strict';

let service = require('../lib/order-service');

Bento.Register.Controller('Shop/OrdersController', (controller) => {

  controller.quickcharge = function *() {
    return yield service.quickCharge(this.payload, this.auth.user);
  };

  controller.topup = function *() {
    return yield service.topUp(this.payload, this.auth.user);
  };

  controller.refund = function *(id) {
    return yield service.refund(this.payload, id, this.auth.user);
  }; 

  controller.retryPayment = function *(id) {
    return yield service.retryPayment(id, this.payload, this.auth.user);
  }

  controller.lateFees = function *(id) {
    return yield service.lateFees(id, this.query, this.auth.user);
  }

  // Creates a new order.
  controller.create = function *() {
    return yield service.create(this.payload, this.auth.user);
  };

  controller.authorize = function *() {
    return yield service.authorize(this.payload, this.auth.user);
  };

  controller.capture = function *(id) {
    return yield service.captures(id, this.payload, this.auth.user);
  };

  controller.index = function *() {
    return yield service.index(this.query, this.auth.user);
  };

  controller.show = function *(id) {
    return yield service.show(id, this.auth.user);
  };

  return controller;

});
