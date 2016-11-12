'use strict';

let service = require('../lib/contact-service');

Bento.Register.Controller('ContactController', function(controller) {

  controller.send = function *() {
    return yield service.deliverMessage(this.payload, this.auth.user);
  };

  controller.sms = function *() {
    return yield service.deliverSms(this.url);
  }

  return controller;

});
