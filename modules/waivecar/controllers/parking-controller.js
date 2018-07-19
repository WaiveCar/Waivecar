'use strict';

let parking = require('../lib/parking-service');

Bento.Register.Controller('ParkingController', function(controller) {
  controller.create = function*() {
    return yield parking.create(this.payload, this.auth.user);
  };

  controller.toggle = function*(id, type) {
    return yield parking.toggle(id, type);
  };

  controller.updateNote = function*(id) {
    return yield parking.updateParking(id, this.payload);
  };

  return controller;
});
