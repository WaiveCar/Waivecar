'use strict';

let User   = Bento.model('User');
let hooks  = Bento.Hooks;
let auth   = Bento.Auth;
let error  = Bento.Error;
let facebookService = require('./facebook-service');

module.exports = class AuthService {

  /**
   * Authorize a user by the provided identifier and password.
   * @param  {Object} payload
   * @return {Object}
   */
  static *login(payload) {
    return yield hooks.require('auth:login', payload);
  }

  static *social(target, data, _user) {
    let user = yield facebookService.handle(data, _user);
    if(user && (user._type === 'waitlist' || user.isNew)) {
      console.log(this);
      return user;
    }

    // ### Connect
    // A connect request does not require us to return an authentication
    // token since the user is already signed in.

    if (data.type === 'connect') {
      return;
    }

    console.log('breakpoint in auth-service')
    return yield hooks.require('auth:social', user, data.options || {});
  }

};
