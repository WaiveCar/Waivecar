'use strict';

let Service = require('./classes/service');
let Verification = require('./checkr');
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
      // If the license has been provided, a check for it is created to be fetched later by the license-sync process
      payload.package = 'motor_vehicle_report';
      payload['candidate_id'] = license.linkedUserId;
      check = yield Verification.createCheck(payload, _user);
      status = 'pending';
      checkId = check.id;
      reportId = check['motor_vehicle_report_id'];
    }
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

  // Reports are immutable on checkr so if a user has an updated
  // one then the previous uuid is invalidated and they are issued
  // a new one.  This means that if we get a 404 for a report id
  // we need to go back to the candidate endpoint and get a new
  // one
  static *updateReport(license) {
    let report = yield Verification.request(`/reports/${license.checkId}`);
    if (report && report['motor_vehicle_report_id']) {
      yield license.update({reportId: report['motor_vehicle_report_id']});
      return yield Verification.getReport(report['motor_vehicle_report_id']);
    }
  }

  // This function is used by the task that checks for updated licenses
  static *syncLicenses() {
    let licenses = yield this.getLicensesInProgress();
    let count = licenses.length;
    log.info(`License : Checking ${count} Licenses`);
    for (let i = count - 1; i >= 0; i--) {
      let license = licenses[i];
      let user = yield User.findById(license.userId);
      if (!(yield redis.shouldProcess('license', license.userId, 9 * 1000))) {
        continue;
      }
      let update = yield Verification.getReport(license.reportId);

      if (!update) {
        update = yield this.updateReport(license);
        log.info(`Checking ${user.name()} ... updating report`);
      }

      if (update && (update.status !== license.outcome) ) {
        log.info(`Checking for ${user.name()} - updating`);
        log.debug(`${update.id} : ${update.status}`);
        if (update.status === 'consider') {
          yield notify.slack(
            {text: `:bicyclist: ${user.link()} license moved to 'consider'`},
            {channel: '#user-alerts'},
          );
        }
        if (update.status === 'clear') {
          yield notify.slack(
            {text: `:bicyclist: ${user.link()} license moved to 'clear'.`},
            {channel: '#user-alerts'},
          );
        }
        yield license.update({
          status: update.status,
          outcome: update.status,
          verifiedAt: new Date(),
          report: JSON.stringify(update),
        });
        relay.admin('licenses', {
          type: 'update',
          data: license,
        });
      } else {
        log.info(`Checking for ${user.name()} - nothing`);
      }
    }
    log.info("Done checking licenses");
  }
};
