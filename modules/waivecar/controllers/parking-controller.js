'use strict';

let parking = require('../lib/parking-service');

Bento.Register.Controller('ParkingController', function(controller) {
  controller.create = function*() {
    return yield parking.create(this.payload);
  };

  controller.getByUser = function*(userId) {
    return yield parking.getByUser(userId);
  };

  controller.delete = function*(id) {
    return yield parking.delete(id);
  };

  controller.toggle = function*(id, type) {
    return yield parking.toggle(id, type);
  };

  controller.updateParking = function*(id) {
    return yield parking.updateParking(id, this.payload);
  };

  controller.reserve = function*(id) {
    return yield parking.reserve(id, this.payload.userId);
  };

  controller.cancel = function*(id) {
    return yield parking.cancel(
      id,
      this.payload.userId,
      this.payload.reservationId,
    );
  };

  return controller;
});
