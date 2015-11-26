'use strict';

let error = Bento.Error;

module.exports = {

  /**
   * Invalid user error that should be thrown when a user record cannot be found
   * when retrieving an ID from an internal source.
   * @type {Object}
   */
  invalidUser : () => {
    throw error.parse({
      type    : `INVALID_USER`,
      message : `The token provided belongs to a user that is no longer accessible.`
    }, 400);
  },

  /**
   * Should be thrown when a user is attempting to authenticate with the API with
   * invalid authentication credentials.
   * @type {Object}
   */
  invalidCredentials : () => {
    throw error.parse({
      type    : `INVALID_CREDENTIALS`,
      message : `The email and/or password provided is invalid.`
    }, 400);
  }

};
