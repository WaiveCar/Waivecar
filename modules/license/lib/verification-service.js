'use strict';

let Service = require('./classes/service');
let Verification = require('./checkr');
let notify = Bento.module('waivecar/lib/notification-service');
let redis = require('../../waivecar/lib/redis-service');
let User = Bento.model('User');
let relay = Bento.Relay;
let log = Bento.Log;
let sequelize = Bento.provider('sequelize');
let apiConfig = Bento.config.api;

module.exports = class LicenseVerificationService extends Service {
  // Executes a request for a license to be verified.
  static *store(id, data, _user) {
    let user = yield this.getUser(data.userId);

    if(_user) {
      this.hasAccess(user, _user);
    } else {
      _user = user;
    }

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
      check = yield Verification.createCheck(payload, _user, license);
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

  // Sometimes we just don't start the process for a user who is ready to
  // start their process. This checks to see if people should be ran but
  // haven't.
  static *submitIfReady() {
    let resTable = yield sequelize.query([
      'select licenses.id as licenseId, users.id as userId, licenses.last_name as ln',
      'from licenses',
      'join users on users.id = licenses.user_id', 
      'where', 
      [
        'report is null',
        'outcome is null',
        'avatar is not null',
        'file_id is not null',
        'stripe_id is not null',
        'tested = true',
        // 'linked_user_id like "%-%"',
        'users.deleted_at is null',
        'licenses.deleted_at is null',
        'licenses.id is not null',
        'licenses.status = "provided"',
      ].join(' and ')
    ].join(' '), { type: sequelize.QueryTypes.SELECT });

    for(var ix = 0; ix < resTable.length; ix++) {
      let row = resTable[ix];
      // console.log(`Trying user: ${row['licenseId']}, ${row['userId']}, ${row['ln']}`);
      try {
        yield this.store(row['licenseId'], {userId: row['userId']});
      } catch(ex) {
        // console.log(`Unable to retrieve license for user ${row['userId']}`);
      }
    }
  }

  // Reports are immutable on checkr so if a user has an updated
  // one then the previous uuid is invalidated and they are issued
  // a new one.  This means that if we get a 404 for a report id
  // we need to go back to the candidate endpoint and get a new
  // one
  static *updateReport(license) {
    var report;
    try { 
      report = yield Verification.request(`/reports/${license.checkId}`);
    } catch(ex) {
      log.info(`Failed to get report ${ license.checkId } for license ${ license.id }`);
    }
    if (report && report['motor_vehicle_report_id']) {
      yield license.update({reportId: report['motor_vehicle_report_id']});
      return yield Verification.getReport(report['motor_vehicle_report_id']);
    }
  }

  // This function is used by the task that checks for updated licenses
  static *syncLicenses() {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    let licenses = yield this.getLicensesInProgress();
    let count = licenses.length;

    yield this.submitIfReady();

    log.info(`License : Checking ${count} Licenses`);
    for (let i = count - 1; i >= 0; i--) {
      let license = licenses[i];
      let user = yield User.findById(license.userId);
      console.log("Checking for " + user.name());
      if (!(yield redis.shouldProcess('license', license.userId, 9 * 1000))) {
        console.log(" skipping");
        continue;
      }
      // log.info(`Checking ${user.name()} ...`);

      console.log(" outcome: " + license.outcome);
      if(license.outcome === 'clear') {
        yield license.update({
          status: 'complete'
        });
        continue;
      }

      let update = yield Verification.getReport(license.reportId);

      if (!update) {
        console.log(" no report");
        update = yield this.updateReport(license);
        console.log(" got report");
        // log.info(`Checking ${user.name()} ... updating report`);
      }

      if (update && (update.status !== license.outcome) ) {
        // log.info(`Checking ${user.name()} - updating`);
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
          yield notify.sendTextMessage(user, `Congrats! You have been approved to use Waive! Log in to the app and go get a car! Yay!`);
        }
        yield license.update({
          status: 'complete',
          outcome: update.status,
          verifiedAt: new Date(),
          report: JSON.stringify(update),
        });
        relay.admin('licenses', {
          type: 'update',
          data: license,
        });
      } else {
        // log.info(`Checking for ${user.name()} - nothing`);
      }
    }
    log.info("Done checking licenses");
  }
};
