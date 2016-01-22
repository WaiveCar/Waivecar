'use strict';

let error = Bento.Error;

module.exports = {

  /**
   * Returns a invalid credentials access error object.
   * @return {Object}
   */
  rolesInvalidCredentials() {
    return error.parse({
      code    : `ROLES_INVALID_CREDENTIALS`,
      message : `You do not possess the required credentials to access roles.`
    }, 400);
  }

};
