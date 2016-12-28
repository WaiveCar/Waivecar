let storage = require('local-storage');
let relay   = require('../relay');
let User    = require('./user');
let roles   = [];

module.exports = {

  /**
   * The authenticated user id.
   * @type {Number}
   */
  id : null,

  /**
   * Sets the authentication roles defined in the api.
   * @param  {Array} list
   * @return {Void}
   */
  roles(list) {
    if (list) {
      roles = list;
    } else {
      return roles;
    }
  },

  /**
   * Returns the current authenticated user.
   * @return {Object}
   */
  user() {
    let users = relay.getState('me');
    if (users) {
      let state = users.find(val => val.id === this.id);
      if (state) {
        return new User(state, roles);
      }
    }
    return null;
  },

  /**
   * Returns a boolean value determining the existence of a user.
   * @return {Boolean}
   */
  check() {
    return this.id ? true : false;
  },

  /**
   * Returns the auth token from the local storage.
   * @param  {String} value Optional token value when wanting to set a token.
   * @return {String}
   */
  token(value) {
    if (!value) {
      return storage.get('auth_token');
    }
    storage.set('auth_token', value);
  },

  /**
   * Sets the provided user data as the authenticated user and stores
   * the authentication token in the local store.
   * @param {Object} user
   */
  set(user) {
    this.id = user.id;
    // Beforehand ct decided to mangle the auth user
    // in with like, search results, and then search
    // for them linearly each time in some retarded 
    // way.  Wow...
    relay.dispatch('me', {
      type : 'store',
      data : user
    });
    /*
    relay.dispatch('users', {
      type : 'store',
      data : user
    });
    */
  },

  /**
   * Terminates the authenticated user.
   * @return {Void}
   */
  logout() {
    this.id = null;
    storage.remove('auth_token');
  }

};
