'use strict';

let service = require('../lib/log-service');

Bento.Register.Controller('LogsController', (controller) => {

  controller.create = function *(type) {
    return yield service.create(type, this.payload);
  };

  controller.revenue = function *(type) {
    return yield service.revenue(type);
  };

  controller.stats = function *(type) {
    return yield service.stats(type);
  };
  
  controller.report = function *(year_month, type) {
    return yield service.report(year_month, type, this.query);
  };

  controller.index = function *(type) {
    return yield service.index(type, this.query);
  };

  controller.show = function *(type, id) {
    return yield service.getLog(type, id);
  };

  controller.update = function *(type, id) {
    return yield service.update(type, id, this.payload);
  };

  controller.resolve = function *(type, id) {
    return yield service.resolve(type, id);
  };

  return controller;

});
