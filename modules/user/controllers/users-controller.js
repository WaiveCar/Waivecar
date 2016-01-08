'use strict';

let service = require('../lib/user-service');
let error   = Bento.Error;

Bento.Register.ResourceController('User', 'UsersController', (controller) => {

  /**
   * Creates a new user.
   * @return {Object}
   */
  controller.store = function *() {
    return yield service.store(this.payload, this.auth.user);
  };

  /**
   * Returns an indexed array of users.
   * @return {Array}
   */
  controller.index = function *() {
    return yield service.index(this.query, this.auth.user);
  };

  /**
   * Returns a requested user.
   * @param  {Number} id
   * @return {Object}
   */
  controller.show = function *(id) {
    return yield service.get(id, this.auth.user);
  };

  /**
   * Returns the current authenticated user.
   * @return {Object}
   */
  controller.me = function *() {
    if (this.auth.check()) {
      return this.auth.user;
    }
    throw error.parse({
      code    : `INVALID_TOKEN`,
      message : `No user was found under the provided authentication token.`
    }, 404);
  };

  /**
   * Updates the provided user.
   * @param  {Number} id
   * @return {Object}
   */
  controller.update = function *(id) {
    return yield service.update(id, this.payload, this.auth.user);
  };

  /**
   * Deletes the provided user.
   * @param  {Number} id
   * @return {Object}
   */
  controller.delete = function *(id) {
    return yield service.delete(id, this.query, this.auth.user);
  };

  // ### Token Services

  /**
   * Verifies a user token.
   * @yield {[type]} [description]
   */
  controller.verify = function *() {
    return yield service.verify(this.payload.token);
  };

  /**
   * Request a password token.
   * @return {Object}
   */
  controller.passwordToken = function *() {
    return yield service.passwordToken(this.payload.identifier, this.payload.resetUrl);
  };

  /**
   * Request a password reset.
   * @return {Object}
   */
  controller.passwordReset = function *() {
    return yield service.passwordReset(this.payload.token, this.payload.password);
  };

  return controller;

});
