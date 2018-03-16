'use strict';

let service = require('../lib/user-service');
let error   = Bento.Error;

Bento.Register.ResourceController('User', 'UsersController', (controller) => {

  controller.store = function *() {
    return yield service.store(this.payload, this.auth.user);
  };

  controller.index = function *() {
    return yield service.index(this.query, this.auth.user);
  };

  controller.show = function *(id) {
    return yield service.get(id, this.auth.user);
  };

  controller.me = function *() {
    if (this.auth.check()) {
      // We are also piggy-backing the user agent on top of this.
      // see ticket #561 for more details.
      if( 
        ('request' in this) &&
        ('header' in this.request) &&
        ('user-agent' in this.request.header) &&
        (this.auth.user.device !== this.request.header['user-agent']) 
      ) {
        yield this.auth.user.update({device: this.request.header['user-agent']});
      }
      var model = Object.assign({}, this.auth.user);
      model.booking = yield this.auth.user.currentBooking();

      return model;
    }
    throw error.parse({
      code    : `INVALID_TOKEN`,
      message : `No user was found under the provided authentication token.`
    }, 404);
  };

  controller.update = function *(id) {
    return yield service.update(id, this.payload, this.auth.user);
  };

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

  controller.passwordToken = function *() {
    let tokenObj = yield service.generatePasswordToken(this.payload.identifier);
    return yield service.sendPasswordReset(tokenObj, this.payload.resetUrl);
  };

  controller.passwordReset = function *() {
    return yield service.passwordReset(
      this.payload.token, 
      this.payload.identifier, 
      this.payload.hash,
      this.payload.password
    );
  };
  controller.passwordSetAdmin = function *(id) {
    return yield service.passwordSetAdmin(id, this.payload.password, this.auth.user)
  };

  return controller;

});
