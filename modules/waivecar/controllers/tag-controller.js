'use strict';

let service = require('../lib/tag-service');

Bento.Register.Controller('TagController', function (controller) {

  controller.index = function* () {
    return yield service.index();
  };

  controller.create = function* () {
    return yield service.create(this.payload);
  };

  controller.update = function* (id) {
    return yield service.update(id, this.payload);
  };

  controller.delete = function* (id) {
    return yield service.delete(id);
  };

  controller.addToCar = function* (tagId, carId) {
    return yield service.addToCar(tagId, carId);
  }

  controller.removeFromCar = function* (tagId, carId) {
    return yield service.removeFromCar(tagId, carId);
  }

  return controller;
});
