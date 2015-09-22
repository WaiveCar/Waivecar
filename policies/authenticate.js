'use strict';

let error = Reach.Error;

module.exports = function *authenticate() {
  if (!this.auth.check()) {
    throw error.parse({
      code    : `MISSING_CREDENTIALS`,
      message : `You must be signed in to gain access to this route.`
    }, 401);
  }
}