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
    console.log('Data: ', data, '\n_user: ', _user);
    console.log('Facebook auth type: ', data.type);
    //let service = getSocialService(target);
    let user    = yield facebookService.handle(data, _user);

    if(user && user._type === 'waitlist') {
      return user;
    }

    // ### Connect
    // A connect request does not require us to return an authentication
    // token since the user is already signed in.

    if (data.type === 'connect') {
      return;
    }

    return yield hooks.require('auth:social', user, data.options || {});
  }

};
