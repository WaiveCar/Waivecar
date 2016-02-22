'use strict';

let service = require('../lib/contact-service');

Bento.Register.Controller('ContactController', function(controller) {

  /**
   * Deliver contact message
   * @return {Object}
   */
  controller.send = function *() {
    return yield service.deliverMessage(this.payload, this.auth.user);
  };

  return controller;

});
