'use strict';

let register = Reach.Register;
let error    = Reach.ErrorHandler;

/* istanbul ignore next: reach-api does not include modules utilizing these features */

module.exports = function *() {

  // ### Authenticate
  // Authenticates the incoming request before allowing access to the route

  yield register.policy('authenticate', function *() {
    if (!this.auth.check()) {
      throw error.parse({
        code    : 'AUTH_ERROR',
        message : 'You do not have the required permissions'
      }, 401);
    }
  });

  yield register.policy('admin', function *() {
    if ('admin' !== this.user.role) {
      throw error.parse({
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