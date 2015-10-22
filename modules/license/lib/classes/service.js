'use strict';

let License = Reach.model('License');
let User    = Reach.model('User');
let error   = Reach.Error;

module.exports = class Service {

  /**
   * Retrieves a license from the database.
   * @param  {Number} id
   * @return {Object}
   */
  *getLicense(id) {
    let license = yield License.findById(id);
    if (!license) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `The requested licsense does not exist`
      }, 400);
    }
    return license;
  }
  
  /**
   * Attempts to return the user with the provided id or throws an error.
   * @param  {Number} id
   * @return {Object}
   */
  *getUser(id) {
    let user = yield User.findById(id);
    if (!user) {
      throw error.parse({
        code    : `INVALID_USER`,
        message : `The user was not found in our records.`
      }, 400);
    }
    return user;
  }

  /**
   * Only allow access if the requesting user is the actor or is administrator.
   * @param  {Object}  user  The user to be modified.
   * @param  {Object}  _user The user requesting modification.
   * @return {Boolean}
   */
  hasAccess(user, _user) {
    if (user.id !== _user.id && _user.role !== 'admin') {
      throw error.parse({
        error   : `INVALID_PRIVILEGES`,
        message : `You do not have the required privileges to perform this operation.`
      }, 400);
    }
  }

}