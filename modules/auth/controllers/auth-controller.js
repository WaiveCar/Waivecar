'use strict';

let auth = require('../lib/auth-service');

Bento.Register.Controller('AuthController', (controller) => {

  controller.login = function *() {
    return yield auth.login(this.payload);
  };

  controller.facebook = function *() {
    return yield auth.social('facebook', this.payload, this.auth.user);
  };

  controller.remember = function *() {
    yield this.auth.remember();
  };

  controller.validate = function *() {
    // If we hit this method we are validated
  };

  controller.logout = function *() {
    return yield this.auth.logout(this.query.from);
  };

  return controller;

});
