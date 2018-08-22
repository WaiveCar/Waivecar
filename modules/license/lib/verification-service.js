'use strict';

let Service      = require('./classes/service');
let Verification = require('./onfido');
let notify       = Bento.module('waivecar/lib/notification-service');
let redis        = require('../../waivecar/lib/redis-service');
let User         = Bento.model('User');
let relay        = Bento.Relay;
let log          = Bento.Log;
let resource     = 'licenses';
let apiConfig    = Bento.config.api;

module.exports = class LicenseVerificationService extends Service {

  /**
   * Executes a request for a license to be verified.
   */
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

      status = 'unknown';
      switch (check.status) {
        case 'in_progress' : case 'awaiting_data' : {
          status = 'in-progress';
          break;
        }
        case 'complete' : {
          status = 'complete';
          break;
        }
      }
      checkId = check.id;
      reportId = check['motor_vehicle_report_id'];
    }

    let report = yield Verification.getReport(reportId);

    if (report.status !== 'pending') {

      report.result = yield this.getResult(report);

      if (report.result === 'consider') {
        yield notify.slack({ text : `:bicyclist: ${ user.link() } license moved to 'consider'.`
        }, { channel : '#user-alerts' });
      }

      if (report.result === 'clear') {
        yield notify.slack({ text : `:bicyclist: ${ user.link() } license moved to 'clear'.`
        }, { channel : '#user-alerts' });
      }

      log.debug(`LICENSE VERIFICATION : ${ report.id } : ${ report.status }`);
      yield license.update({
        status     : report.status,
        outcome    : report.status,
        report     : JSON.stringify(report),
        checkId    : checkId,
        reportId   : reportId,
        verifiedAt : new Date()
      });
    } else {
      yield license.update({
        status   : status,
        checkId  : checkId,
        reportId : reportId
      });
    }

    relay.admin(resource, {
      type : 'update',
      data : license
    });

    return license;
  }

  // The api call for this needs to be fixed
  /**
   * Returns a reigstered card based on the provided cardId.
   */
  static *show(id, data, _user) {
    //let user = yield this.getUser(data.userId);
    //this.hasAccess(user, _user);

    let license = yield this.getLicense(id);
    let report = yield Verification.getChecks(license.linkedUserId, _user);
    return report;
  }

  static *syncLicenses() {
    let licenses = yield this.getLicensesInProgress();
    let count    = licenses.length;

    log.info(`License : Checking ${ count } Licenses`);

    for (let i = count - 1; i >= 0; i--) {
      let license = licenses[i];
      // locking mechanism for scaling
      if (!(yield redis.shouldProcess('license', license.userId))) {
        continue;
      }

      let user    = yield User.findById(license.userId);
      let update  = yield Verification.getReport(license.reportId);
      if (update.status !== license.status) {
        log.debug(`${ update.id } : ${ update.status }`);

        // ### Update License
        let result = yield this.getResult(update);

        if (result === 'consider') {
          yield notify.slack({ text : `:bicyclist: ${ user.link() } license moved to 'consider'` }, { channel : '#user-alerts' });
        }

        yield license.update({
          status     : update.status === 'awaiting_data' || update.status === 'in_progress' ? 'in-progress' : update.status,
          outcome    : result,
          verifiedAt : new Date()
        });

        // ### Notify Changes
        //
        // This code seems to never run so this message has been moved to lib/license-service.js  
        //
        // if (license.status === 'complete' && result === 'clear') {
        //  yield notify.sendTextMessage(user, `Congrats! You have been approved to drive with WaiveCar! But not so fast! Give us a call at 1-855-924-8355 so we can give you a run down on our rules and regulations before your first trip.`);
        // }
        //

        relay.admin(resource, {
          type : 'update',
          data : license
        });
      }
    }
  }

  static *getResult(report) {
    // This can be modified to put filters on reports to clear the correct ones for minor things
    return report.result;
  }

};
