'use strict';

let log = require('../lib/log-service');

Bento.Register.Controller('LogController', function(controller) {

  controller.create = function *() {
    return yield log.create(this.payload, this.auth.user);
  };

  controller.index = function *() {
    return yield log.index(this.query, this.auth.user);
  };

  return controller;
});
