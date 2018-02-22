'use strict';

let service = require('../lib/group-service');

Bento.Register.Controller('GroupController', function (controller) {

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

  controller.assignCar = function* (groupRoleId, carId) {
    return yield service.assignCar(groupRoleId, carId);
  }

  controller.removeCar = function* (groupRoleId, carId) {
    return yield service.removeCar(groupRoleId, carId);
  }

  controller.cars = function* (groupRoleId) {
    return yield service.getGroupCars(groupRoleId);
  }

  return controller;
});
