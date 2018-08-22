'use strict';

let Service      = require('../../classes/service');
let Api          = require('../index');
let License      = Bento.model('License');
let User         = Bento.model('User');
let hooks        = Bento.Hooks;
let error        = Bento.Error;
let log          = Bento.Log;

module.exports = class Handler {

  /**
   * Handles the receipt of a completed report from checkr
   */
  static *receive(data) {
    let license = yield this.getLicenseByReport(data.id);

    yield license.update({
      status : data.status
    });

    let update = yield Api.getReport(license.reportId);
    if (update.status !== license.status) {
      yield license.update({
        status     : update.status,
        outcome    : update.result,
        verifiedAt : new Date()
      });
      log.info(`License ${ license.id } updated via webhook.`);
    }
  }
};
