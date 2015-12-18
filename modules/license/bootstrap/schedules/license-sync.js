'use strict';

let moment    = require('moment');
let scheduler = Bento.provider('queue').scheduler;
let log       = Bento.Log;
let service   = require('../../lib/verification-service');

module.exports = function *() {
  scheduler.add('license-sync', {
    init   : true,
    repeat : true,
    timer  : {
      value : 10,
      type  : 'seconds'
    }
  });
};


scheduler.process('license-sync', function *(job) {
  log.info('License : Sync');
  let updateLicenses = yield service.syncLicenses();
});
