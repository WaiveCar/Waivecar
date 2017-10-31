'use strict';

let waivework      = require('../lib/waivework-service');

Bento.Register.Controller('WaiveworkController', function(controller) {

  controller.add = function *() {
    return yield waivework.add(this.payload, this.auth.user);
  }

  controller.index = function *() {
    return yield waivework.index(this.payload, this.auth.user);
  }

  return controller;
});
