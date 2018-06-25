'use strict';

let waitlist      = require('../lib/waitlist-service');

Bento.Register.Controller('WaitlistController', function(controller) {

  controller.prioritize = function *() {
    return yield waitlist.prioritize(this.payload, this.auth.user);
  }

  controller.add = function *() {
    return yield waitlist.add(this.payload, this.auth.user);
  }

  controller.addNote = function *() {
    return yield waitlist.addNote(this.payload, this.auth.user);
  }

  controller.addById = function *() {
    return yield waitlist.addById(this.query, this.auth.user);
  }

  controller.index = function *() {
    return yield waitlist.index(this.query, this.auth.user);
  }

  controller.letIn = function *() {
    return yield waitlist.letIn(this.payload, this.auth.user);
  }

  return controller;
});
