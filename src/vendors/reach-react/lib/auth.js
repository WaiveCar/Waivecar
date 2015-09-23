'use strict';

let storage = require('local-storage');

/**
 * @class Auth
 */
let Auth = module.exports = {};

/**
 * @property user
 * @type     Object
 * @default  null
 */
Auth.user = (function () {
  let user = storage.get('auth');
  if (user) {
    return user;
  }
  return null;
})();

/**
 * @method set
 * @param  {Object} user
 */
Auth.set = function (user) {
  storage.set('auth', user);
  this.user = user;
};

/**
 * Update the authenticated user object.
 * @method put
 * @param  {Object} user
 */
Auth.put = function (user) {
  Object.assign(this.user, user);
  storage.set('auth', this.user);
};

/**
 * @method check
 * @return {Boolean}
 */
Auth.check = function () {
  return this.user ? true : false;
};

/**
 * @method logout
 */
Auth.logout = function () {
  storage.remove('auth');
  this.user = null;
};