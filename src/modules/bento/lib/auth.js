'use strict';

let storage = require('local-storage');
let relay   = require('./relay');

// ### Relay
// Create the authenticated user resource.

relay.resource('me', function (state = null, payload) {
  switch (payload.type) {
    case 'login': {
      return payload.data;
    }
    case 'update': {
      return {
        ...state,
        ...payload.data
      }
    }
    case 'logout': {
      return null;
    }
    default: {
      return state;
    }
  }
});

// ### Auth

module.exports = class Auth {

  /**
   * Returns the current authenticated user.
   * @return {Object}
   */
  static user() {
    return relay.getState('me');
  }

  /**
   * Returns a boolean value determining the existence of a user.
   * @return {Boolean}
   */
  static check() {
    return relay.getState('me') ? true : false;
  }

  /**
   * Returns the auth token from the local storage.
   * @param  {String} value Optional token value when wanting to set a token.
   * @return {String}
   */
  static token(value) {
    if (!value) {
      return storage.get('auth_token');
    }
    storage.set('auth_token', value);
  }

  /**
   * Sets the provided user data as the authenticated user and stores
   * the authentication token in the local store.
   * @param {Object} user
   */
  static set(user) {
    if (user.token) {
      this.token(user.token);
      delete user.token;
    }
    relay.dispatch('me', {
      type : 'login',
      data : user
    });
  }

  /**
   * !DEPRECATED
   */
  static put() {
    // This is now handled via relay...
  }

  /**
   * Terminates the authenticated user.
   * @return {Void}
   */
  static logout() {
    storage.remove('auth_token');
    relay.dispatch('me', {
      type : 'logout'
    });
  }

}
