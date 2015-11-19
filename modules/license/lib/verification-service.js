'use strict';

let relay    = Bento.Relay;
let Service  = require('./classes/service');
let Verification = require('./onfido');
let resource = 'licenses';

module.exports = class LicenseVerificationService extends Service {

  /**
   * Executes a request for a license to be verified.
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}
   */
  static *store(id, data, _user) {
    let user = yield this.getUser(data.userId);
    this.hasAccess(user, _user);

    let license = yield this.getLicense(id);
    let payload = {
      type    : 'express',
      reports : [
        {
          name : 'driving_record'
        }
      ]
    };

    let check = yield Verification.createCheck(license.linkedUserId, payload, _user);
    console.log(check);

    let status = 'unknown';
    switch (check.status) {
      case 'in_progress' : {
        status = 'in-progress';
        break;
      }
    }

    yield license.update({
      status   : status,
      checkId  : check.id,
      reportId : check.reports[0].id
    });

    // ### Relay
    relay.admin(resource, {
      type : 'update',
      data : license
    });

    return license;
  }

  /**
   * Returns a reigstered card based on the provided cardId.
   * @param  {String} cardId
   * @param  {Object} _user  The authenticated user making the request.
   * @return {Object}
   */
  static *show(id, data, _user) {
    //let user = yield this.getUser(data.userId);
    //this.hasAccess(user, _user);

    let license = yield this.getLicense(id);
    let report = yield Verification.getChecks(license.linkedUserId, _user);
    console.log(report);
    return report;
  }

};
