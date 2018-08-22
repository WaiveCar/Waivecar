'use strict';

let License = Bento.model('License');
let User    = Bento.model('User');
let error   = Bento.Error;
let log     = Bento.Log;

module.exports = class Service {

  /**
   * Retrieves a license from the database.
   */
  static *getLicense(id) {
    let license = yield License.findById(id);
    if (!license) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `The requested license does not exist`
      }, 400);
    }
    return license;
  }

  /**
   * Retrieves a license by User Reference from the database.
   */
  static *getLicenseByUserLink(id) {
    let license = yield License.find({ userLinkId : id });
    if (!license) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `A matching license for this linked user cannot be found`
      }, 400);
    }
    return license;
  }

  /**
   * Retrieves a license by Report Reference from the database.
   */
  static *getLicenseByReport(id) {
    let license = yield License.find({ reportId : id });
    if (!license) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `A matching license for this report cannot be found`
      }, 400);
    }
    return license;
  }

  /**
   * Retrieves a license by Checkr's Candidate Id from the database.
   */
  static *getLicensesInProgress() {
    return yield License.find({
      where : {
        status  : 'pending',
        checkId : {
          $ne : null
        }
      }
    });
  }

  /**
   * Attempts to return the user with the provided id or throws an error.
   */
  static *getUser(id) {
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
   */
  static hasAccess(user, _user) {
    if (user.id !== _user.id && !_user.hasAccess('admin')) {
      throw error.parse({
        error   : `INVALID_PRIVILEGES`,
        message : `You do not have the required privileges to perform this operation.`
      }, 400);
    }
  }

};
