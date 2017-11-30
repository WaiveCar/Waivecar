'use strict';

let action      = require('../lib/action-service');

Bento.Register.Controller('ActionController', function(controller) {

  controller.goForward = function *(type, id) {
    return yield action.goForward(type, id, this.auth.user);
  };

  controller.getHash = function *(type, id) {
    return yield action.getHash(type, id, this.auth.user);
  };

  controller.getAction = function *(type, id) {
    return yield action.getAction(type, id, this.auth.user);
  };

  return controller;
});
