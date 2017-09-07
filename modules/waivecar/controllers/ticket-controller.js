'use strict';

let ticket = require('../lib/ticket-service');

Bento.Register.Controller('TicketController', function(controller) {

  controller.index = function *() {
    return yield ticket.index(this.query, this.auth.user);
  };

  controller.create = function *() {
    return yield ticket.create(this.payload, this.auth.user);
  };

  controller.update = function *(id, action) {
    switch (action) {
      case 'update'    : return yield ticket.update(id, this.payload, this.auth.user);
      case 'delete'    : return yield ticket.delete(id, this.payload, this.auth.user);
      default         : {
        throw error.parse({
          code    : `BOOKING_INVALID_ACTION`,
          message : `'${ action }' is not a valid booking action.`
        }, 400);
      }
    }
  };

  return controller;
});
