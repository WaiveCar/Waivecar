'use strict';

let error = Bento.Error;

module.exports = {

  /**
   * Returns a parsed USER_NOT_FOUND error.
   * @return {Object}
   */
  userNotFound() {
    return error.parse({
      code    : `USER_NOT_FOUND`,
      message : `The user your requested does not exist.`
    }, 404);
  },

  /**
   * Returns a parsed USER_UPDATE_REFUSED error.
   * @return {Object}
   */
  userUpdateRefused() {
    return error.parse({
      code    : `USER_UPDATE_REFUSED`,
      message : `You do not possess the valid credentials to update this user.`
    }, 400);
  }

};
