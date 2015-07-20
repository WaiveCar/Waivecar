/*
  Policies
  ========

  Stability: 4 - Locked

  Policies defined here are designed to be available to all api modules. You can
  edit the implementation of policies defined here but do not remove or rename
  them as it can break the system.

  @author  Christoffer Rødvik
  @license MIT
 */

'use strict';

let register = Reach.Register;

/* istanbul ignore next: reach-api does not include modules utilizing these features */

module.exports = function *() {

  // ### Authenticate
  // Authenticates the incoming request before allowing access to the route

  yield register.policy('authenticate', function *() {
    if (!this.auth.check()) {
      this.throw({
        code    : 'AUTH_ERROR',
        message : 'You do not have the required permissions'
      }, 401);
    }
  });

  yield register.policy('admin', function *() {
    if ('admin' !== this.user.role) {
      this.throw({
        code    : 'AUTH_ERROR',
        message : 'You do not have the required permissions'
      }, 401);
    }
  });

  // ### Custom Policies
  // Add your custom policies, usually modules will register their own
  // policies if needed but there should be no issue registering your
  // policies in the interface.

};