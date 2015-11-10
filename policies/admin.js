'use strict';

let error = Bento.Error;

module.exports = function *admin () {
  if (this.auth.user.role !== 'admin') {
    throw error.parse({
      code    : `INVALID_CREDENTIALS`,
      message : `Your account credentials does not allow access to this route.`
    }, 401);
  }
};
