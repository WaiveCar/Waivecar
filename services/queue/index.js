/**
  Kue
  ===
  @author  Christoffer Rødvik (c) 2015
  @license MIT
 */

'use strict';

// ### Dependencies

var kue    = require('kue');
var config = Reach.config.queue;
var queue  = config ? kue.createQueue(config) : null;

// ### Module

module.exports = queue;

// ### Graceful Shutdown

process.once('SIGTERM', function () {
  queue.shutdown(5000, function(err) {
    Reach.Logger.error('Kue shutdown: %s', err || '');
    process.exit(0);
  });
});