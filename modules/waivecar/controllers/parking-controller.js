'use strict';

let parking = require('../lib/parking-service');

Bento.Register.Controller('ParkingController', function(controller) {
  controller.create = function*() {
    return yield parking.create(this.payload, this.auth.user);
  };

  controller.toggle = function*(id, type) {
    return yield parking.toggle(id, type);
  };

  controller.updateParking = function*(id) {
    return yield parking.updateParking(id, this.payload);
  };

  controller.reserve = function*(id) {
    return yield parking.reserve(id, this.auth.user, this.payload.userId);
  };

  return controller;
});
