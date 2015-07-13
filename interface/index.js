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

let register = Reach.Register;
let error    = Reach.ErrorHandler;
let log      = Reach.Logger;

/**
 * @class Interface
 * @static
 */
var Interface = module.exports = {};

/**
 * Loads the Interface onto the worker
 * @method load
 */
Interface.load = function *() {
  let valid = true;

  let policies = require('./policies');
  yield policies();

  // ### Load and Validate User

  log.silent('info')('Interface');
  log.silent('info')('  Load User');

  yield register.models(__dirname, {
    User : 'models/user.js'
  });

  let User            = Reach.model('User');
  let user            = new User({});
  let instanceMethods = ['save', 'update', 'delete', 'toJSON'];
  let staticMethods   = ['find'];

  log.silent('info')('  Validate User');

  instanceMethods.forEach(function (method) {
    if ('function' !== typeof user[method]) {
      log.silent('error')('   - .%s() method is not defined', method);
      valid = false;
    } else {
      log.silent('info')('   - .%s() [OK]', method);
    }
  });

  staticMethods.forEach(function (method) {
    if ('function' !== typeof User[method]) {
      log.silent('error')('   - .%s() method is not defined', method);
      valid = false;
    } else {
      log.silent('info')('   - .%s() [OK]', method);
    }
  });

  // ### Load and Validate Policies

  log.silent('info')('  Validate Policies');
  let policyChecks = ['authenticate', 'admin'];
  policyChecks.forEach(function (id) {
    let handler = Reach.policy(id);
    if (!handler) {
      log.silent('error')('   - %s has not been defined', id);
      valid = false;
    } else {
      log.silent('info')('   - %s [OK]', id);
    }
  });

  if (!valid) {
    throw error.parse({
      code    : 'INVALID_INTERFACE',
      message : 'Your interface setup is invalid'
    });
  }
};