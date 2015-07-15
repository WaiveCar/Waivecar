'use strict';

let moment = require('moment');
let log    = Reach.Log;

/**
 * Scheduler
 * =========
 *
 * Stability: 2 - Unstable
 *
 * @method scheduler
 * @param  {Object} job
 * @param  {String} time A moment string for when to trigger the job
 */
module.exports = function (job, time) {
  let now = moment();

  log.info('Setting [%s] job to run at %s', job.type, time.format('Do MMMM, YYYY - HH:mm:ss'));

  setTimeout(function () {
    job.save(function (err) {
      if (err) {
        log.error('Queue: [%s] job [%s] error', job.type, err);
      }
    });
  }, time.diff(now));
};