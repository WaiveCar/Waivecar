'use strict';

let License = Bento.model('License');
let User    = Bento.model('User');
let error   = Bento.Error;
let log     = Bento.Log;

module.exports = class Service {

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

  static *getLicenseByUserId(id) {
    return yield License.find({
      where: { userId : id },
      order: [['created_at', 'DESC']]
    });
  }

  static *getLicenseByReport(id) {
    let license = yield License.find({where: { reportId : id } });
    if (!license) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `A matching license for this report cannot be found`
      }, 400);
    }
    return license;
  }

  static *getLicensesInProgress() {
    return yield License.find({
      where : {
        $or: [
          {
            status : 'complete',
            outcome : 'pending',
          },
          {
            status  : 'pending',
            checkId : {
              $ne : null
            }
          }
        ]
      }
    });
  }

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

  static hasAccess(user, _user) {
    if (user.id !== _user.id && !_user.hasAccess('admin')) {
      throw error.parse({
        error   : `INVALID_PRIVILEGES`,
        message : `You do not have the required privileges to perform this operation.`
      }, 400);
    }
  }

};
