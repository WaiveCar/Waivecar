/**
  Kue
  ===
  @author  Christoffer Rødvik
  @license MIT
 */

'use strict';

let kue    = require('kue');
let config = Reach.config.queue;
let queue  = config ? kue.createQueue(config) : null;
let log    = Reach.Log;

// ### Module

module.exports = queue;

// ### Graceful Shutdown

process.once('SIGTERM', function () {
  queue.shutdown(5000, function(err) {
    log.error('Kue shutdown: %s', err || '');
    process.exit(0);
  });
});