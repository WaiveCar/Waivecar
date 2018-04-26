'use strict';

let auth = require('../lib/auth-service');

Bento.Register.Controller('AuthController', (controller) => {

  /**
   * Attempts to authenticate a user with the api.
   * @return {Object}
   */
  controller.login = function *() {
    return yield auth.login(this.payload);
  };

  /**
   * Attempts to authenticate the user with the api via facebook.
   * @return {Object}
   */
  controller.facebook = function *() {
    return yield auth.social('facebook', this.payload, this.auth.user);
  };

  controller.remember = function *() {
    yield this.auth.remember();
  };

  /**
   * Attempts to validate the authenticated user.
   * @return {Void}
   */
  controller.validate = function *() {
    // If we hit this method we are validated
  };

  /**
   * Attempts to log the user out of the api.
   * @return {Void}
   */
  controller.logout = function *() {
    return yield this.auth.logout(this.query.from);
  };

  return controller;

});
