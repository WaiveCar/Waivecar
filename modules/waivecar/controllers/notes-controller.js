'use strict';

let notes = require('../lib/notes-service');

Bento.Register.Controller('NotesController', function(controller) {

  controller.add = function *(type) {
    return yield notes.create(type, this.payload, this.auth.user);
  };

  controller.show = function *(type, id) {
    return yield notes.show(type, id, this.auth.user);
  };

  controller.update = function *(type, id) {
    return yield notes.update(type, id, this.payload, this.auth.user);
  };

  controller.remove = function *(type, id) {
    return yield notes.remove(type, id, this.auth.user);
  };

  controller.getBookingNotes = function *(bookingId) {
    return yield notes.getBookingNotes(bookingId, this.query);
  };

  controller.getCarNotes = function *(carId) {
    return yield notes.getCarNotes(carId, this.query);
  };

  controller.getUserNotes = function *(userId) {
    return yield notes.getUserNotes(userId);
  };

  return controller;
});
