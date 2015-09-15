'use strict';

let register = Reach.Register;
let error    = Reach.Error;

/* istanbul ignore next: reach-api does not include modules utilizing these features */

module.exports = function *() {
  
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

};