'use strict';

let service = require('../lib/report-service');

Bento.Register.Controller('ReportsController', function(controller) {

  controller.create = function *() {
    return yield service.create(this.payload, this.auth.user);
  };

  controller.status = function *() {
    return yield service.status();
  };

  controller.showForCar = function *(id) {
    return yield service.showForCar(id, this.query);
  };

  controller.showMileage = function *(date) {
    return yield service.showMileage(date);
  };

  controller.goodyear = function *(date) {
    return yield service.goodyear(date);
  };

  controller.delete = function *(id) {
    return yield service.delete(id, this.auth.user);
  };

  return controller;

});
