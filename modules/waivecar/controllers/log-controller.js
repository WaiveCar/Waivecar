'use strict';

let log = require('../lib/log-service');

Bento.Register.Controller('LogController', function(controller) {

  controller.create = function *() {
    return yield log.create(this.payload, this.auth.user);
  };

  controller.carHistory = function *(car) {
    console.log(this.query);
    return yield log.carHistory(car, this.auth.user);
  };

  controller.index = function *() {
    console.log(this.query);
    return yield log.index(this.query, this.auth.user);
  };

  return controller;
});
