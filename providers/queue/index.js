'use strict';

let log = Bento.Log;

// ### Queue

let Queue = module.exports = require('./lib/client');

/**
 * Adds ability to schedule jobs
 * @property scheduler
 * @type     Scheduler
 */
Queue.scheduler = require('./lib/scheduler');

/**
 * Load all jobs in provided folder.
 * @property loader
 * @type     Function
 */
Queue.loader = require('./lib/loader');

// ### Graceful Shutdown

// process.once('SIGTERM', () => {
//   Queue.shutdown(5000, function(err) {
//     log.error(`Kue shutdown: ${ err || '' }`);
//     process.exit(0);
//   });
// });
