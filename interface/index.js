/**
  Interface
  =========

  Stability: 2 - Unstable

  The Interface is a shared interface that is available to all modules implemented in the system.
  It provides the developer with functionality that has been feature locked and won't change
  unless there is an absolute priority for it. The reason for this is that if the Interface
  changes its implementation all modules relying on the Interface would cease to function unless
  updated.

  Features may be added but never removed or changed once finalized.

  The sanbox functions in such a way that the implementation of the features are decided by
  the developer and not by the framework. The only requirement is that the interfaces are
  implemented correctly and produce expected results.

  On startup the system looks for the required Interface features and will halt system startup
  if it is missing implementation.

  ### User

  A user model has to be registered in the system providing a set of methods that provides
  expected results. The user model is often used across multiple modules and must be defined
  with a set standard for all modules to make use of.

    #### Parameters

    A module might need special parameters on the user module so make sure you add the
    fields required by the modules you install.

    #### Methods

    A module might need to fetch users as well as save, update and delete them. The user
    model must come with the following yieldable methods.

      .save()
      .find()
      .update()
      .delete()
      .toJSON()

    #### Middleware

    Modules should have access to the `user` object of the authenticated user in each call.
    It should also have access to `.check()` if a user is authenticated.

      this.auth.user
      this.auth.check()

  @author  Christoffer Rødvik (c) 2015
  @license MIT
 */

'use strict';

let log = Reach.Logger;

require('./policies');

/**
 * @class Interface
 * @static
 */
var Interface = module.exports = {};

/**
 * Validates the current Interface implementation
 * @method valid
 * @return {bool}
 */
Interface.valid = function () {
  if (!validUser())     { return false; }
  if (!validPolicies()) { return false; }
  return true;
};

/**
 * Loads the Interface onto the worker
 * @method load
 */
Interface.load = function () {
  Reach.register.models(__dirname, {
    User : 'models/user'
  });
};

/**
 * Validate the user implementation
 * @private
 * @method validUser
 * @return {bool}
 */
function validUser() {
  var valid = true;

  log.silent('info')('Check User');

  // ### Validate Model

  var User = require('./models/user');
  if (!User) {
    log.silent('error')(' - User model has not been defined');
    return false;
  }

  // ### Validate Methods

  var user            = new User({});
  var instanceMethods = ['save', 'update', 'delete', 'toJSON'];
  var staticMethods   = ['find'];

  instanceMethods.forEach(function (method) {
    if ('function' !== typeof user[method]) {
      log.silent('error')(' - User model is missing .%s() method', method);
      valid = false;
    }
  });

  staticMethods.forEach(function (method) {
    if ('function' !== typeof User[method]) {
      log.silent('error')(' - User model is missing .%s() method', method);
      valid = false;
    }
  });

  return valid;
}

/**
 * Validate the Interface policies
 * @private
 * @method validPolicies
 * @return {bool}
 */
function validPolicies() {
  var valid = true;

  log.silent('info')('Check Policies');

  var policies = ['authenticate'];
  policies.forEach(function (id) {
    var handler = Reach.policy(id);
    if (!handler) {
      log.silent('error')(' - Policy %s has not been defined', id);
      valid = false;
    }
  });

  return valid;
}