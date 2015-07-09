/*
  Reach API
  =========

  Stability : 3 - Stable

  This API is currently very unstable and should not be used in production, it is missing core
  functionality required for a solid development experience.

  @author  Christoffer Rødvik
  @license MIT
 */

'use strict';

var co      = require('co');
var cluster = require('cluster');

// ### Reach API

require('reach-api');

co(function *() {
  if (cluster.isMaster) {
    yield master();
  } else {
    yield worker();
  }
});

/**
 * Bootstrap on master
 * @method master
 */
function *master() {
  let cpus  = require('os').cpus().length;
  let title = Reach.config.api.name + ' @ ' + Reach.config.api.version;
  let bline = new Array(title.length + 1).join('=');

  console.log('\n  ' + title);
  console.log('  ' + bline);

  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on('exit', function (worker) {
    console.log('Worker %s died!', worker.id);
  });

  console.log('\n  MASTER BOOTSTRAP\n');


  try {
    yield Reach.Bootstrap();
  } catch (err) {
    console.log('\n  You have a fatal system error in your code, you must fix these errors before proceeding\n');
    return process.exit(1);
  }

  console.log('\n  STARTING WORKERS\n');
}

/**
 * Starts app on a worker
 * @method worker
 */
function *worker() {
  try {
    yield Reach.App();
  } catch (err) {
    if (err) {
      console.log('\n  You have a fatal system error in your code\n');
    }
  }
}