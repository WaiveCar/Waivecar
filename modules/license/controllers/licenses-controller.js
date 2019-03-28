'use strict';

let service = require('../lib/license-service');

Bento.Register.Controller('LicensesController', function(controller) {

  controller.store = function *() {
    return yield service.store(this.payload, this.auth.user);
  };

  controller.index = function *() {
    return yield service.index(this.query, this.auth.user);
  };

  controller.show = function *(id) {
    return yield service.show(id, this.auth.user);
  };

  controller.update = function *(id) {
    return yield service.update(id, this.payload, this.auth.user);
  };

  controller.unspecificUpdate = function *() {
    return yield service.unspecificUpdate(this.payload, this.auth.user);
  };

  controller.delete = function *(id) {
    return yield service.delete(id, this.auth.user);
  };

  return controller;

});
