'use strict';

let Service     = require('../../classes/service');
let License = Bento.model('License');
let User    = Bento.model('User');
let hooks   = Bento.Hooks;
let error   = Bento.Error;
let log     = Bento.Log;

module.exports = class Handler {

  /**
   * Handles the receipt of a completed report from checkr
   * @param {Object} payload
   */
  static *receive(payload) {
    let report = payload.data.object;
    let license = yield this.getLicenseByCandidate(report.id);

    yield license.update({
      status : report.status
    });

    log.debug(`License Hook #{ JSON.stringify(payload) }`);

    // // ### Hook
    yield hooks.call('license:checked', report, license);
  }

}
