'use strict';

let User   = Bento.model('User');
let hooks  = Bento.Hooks;
let auth   = Bento.Auth;
let error  = Bento.Error;

module.exports = class AuthService {

  static *login(payload) {
    return yield hooks.require('auth:login', payload);
  }

  static *social(target, data, _user) {
    let service = getSocialService(target);
    let user    = yield service.handle(data, _user);

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

/**
 * Returns the requested social service class.
 * @param  {String} target
 * @return {Object}
 */
function getSocialService(target) {
  switch (target) {
    case 'facebook' : return require('./facebook-service');
    default         : {
      throw error.parse({
        code    : 'AUTH_INVALID_SOCIAL',
        message : 'The social service requested for authentication is not supported'
      }, 400);
    };
  }
}
