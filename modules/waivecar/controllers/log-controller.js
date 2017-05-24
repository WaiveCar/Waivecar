'use strict';

let log = require('../lib/log-service');

Bento.Register.Controller('LogController', function(controller) {

  controller.create = function *() {
    return yield log.create(this.payload, this.auth.user);
  };

  controller.carHistory = function *(car) {
    return yield log.carHistory(this.query, car);
  };

  controller.bookingHistory = function *(booking) {
    return yield log.bookingHistory(this.query, booking);
  };

  controller.index = function *() {
    return yield log.index(this.query, this.auth.user);
  };

  return controller;
});
