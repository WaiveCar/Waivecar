'use strict';

let error = Bento.Error;

module.exports = {
  invalidUser() {
    throw error.parse({
      code    : `AUTH_INVALID_USER`,
      message : `The token provided belongs to a user that is no longer accessible.`
    }, 400);
  },

  invalidCredentials() {
    throw error.parse({
      code    : `AUTH_INVALID_CREDENTIALS`,
      message : `The credentials provided does not match any user in our database.`
    }, 400);
  }
};
