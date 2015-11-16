'use strict';

let relay    = Bento.Relay;
let Service  = require('./classes/service');
let Checkr   = require('./checkr');
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
    let report = {
      package        : 'driver_standard',
      'candidate_id' : license.candidateId
    };

    let candidate = yield Checkr.createReport(report, _user);

    yield license.update({
      status   : candidate.status,
      reportId : candidate['motor_vehicle_report_id']
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
    let report = yield Checkr.getReport(license.reportId, _user);
    console.log(report);
    return report;
  }

};
