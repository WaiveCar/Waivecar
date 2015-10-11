'use strict';

import storage from 'local-storage';

class Auth {

  /**
   * Assign the authenticated user.
   * @return {Void}
   */
  constructor() {
    this.user = user();
  }

  /**
   * Returns a boolean value determining the existence of a user.
   * @return {Boolean}
   */
  check() {
    return this.user ? true : false;
  }

  /**
   * Stores the provided user with the auth class, and local store.
   * @param {Object} user
   */
  set(user) {
    storage.set('auth', user);
    this.user = user;
  }

  /**
   * Updates the authenticated user object.
   * @param  {Obejct} user
   * @return {Void}
   */
  put(user) {
    Object.assign(this.user, user);
    storage.set('auth', this.user);
  }

  /**
   * Terminates the authenticated user.
   * @return {Void}
   */
  logout() {
    storage.remove('auth');
    this.user = null;
  }

}

/**
 * Returns the user currently stored under the local auth key.
 * @return {Object}
 */
function user() {
  let user = storage.get('auth');
  if (user) {
    return user;
  }
  return null;
}

module.exports = new Auth();