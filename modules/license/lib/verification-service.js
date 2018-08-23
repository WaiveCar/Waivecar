'use strict';

let Service = require('./classes/service');
let Verification = require('./onfido');
let notify = Bento.module('waivecar/lib/notification-service');
let redis = require('../../waivecar/lib/redis-service');
let User = Bento.model('User');
let relay = Bento.Relay;
let log = Bento.Log;
let apiConfig = Bento.config.api;

module.exports = class LicenseVerificationService extends Service {
  // Executes a request for a license to be verified.
  static *store(id, data, _user) {
    let user = yield this.getUser(data.userId);
    this.hasAccess(user, _user);

    let license = yield this.getLicense(id);
    let status = license.status;
    let checkId = license.checkId;
    let reportId = license.reportId;
    let check;
    let payload = {};

    if (status === 'provided') {
      payload.package = 'motor_vehicle_report';
      payload['candidate_id'] = license.linkedUserId;

      check = yield Verification.createCheck(payload, _user);
      status = 'pending';
      checkId = check.id;
      reportId = check['motor_vehicle_report_id'];
    }
    let report = yield Verification.getReport(reportId);

    yield license.update({
      status: status,
      checkId: checkId,
      reportId: reportId,
    });
    relay.admin('licenses', {
      type: 'update',
      data: license,
    });
    return license;
  }

  static *syncLicenses() {
    let licenses = yield this.getLicensesInProgress();
    let count = licenses.length;
    log.info(`License : Checking ${count} Licenses`);
    for (let i = count - 1; i >= 0; i--) {
      let license = licenses[i];

      if (!(yield redis.shouldProcess('license', license.userId))) {
        continue;
      }

      let user = yield User.findById(license.userId);
      let update = yield Verification.getReport(license.reportId);
      if (update.status !== license.status) {
        log.debug(`${update.id} : ${update.status}`);

        let result = yield this.getResult(update);
        if (result === 'consider') {
          yield notify.slack(
            {text: `:bicyclist: ${user.link()} license moved to 'consider'`},
            {channel: '#user-alerts'},
          );
        }
        if (result === 'clear') {
          yield notify.slack(
            {text: `:bicyclist: ${user.link()} license moved to 'clear'.`},
            {channel: '#user-alerts'},
          );
        }
        yield license.update({
          status: result,
          outcome: result,
          verifiedAt: new Date(),
          report: JSON.stringify(update),
        });
        relay.admin('licenses', {
          type: 'update',
          data: license,
        });
      }
    }
  }

  static *getResult(report) {
    // This can be modified to put filters on reports to clear the correct ones for minor things
    return report.status;
  }
};
