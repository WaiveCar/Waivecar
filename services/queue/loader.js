'use strict';

let fs    = require('fs');
let path  = require('path');
let queue = Reach.service('queue');
let log   = Reach.Log;

module.exports = function (jobsDir) {
  if (!queue) {
    log.silent('error')('Queue is missing [queue] in api configuration');
    return;
  }

  if (!fs.existsSync(jobsDir)) {
    log.silent('warn')(' - Queue: Could not find jobs folder [%s]', jobsDir);
    return;
  }

  let jobs = fs.readdirSync(jobsDir);
  jobs.forEach(function (job) {
    require(path.join(jobsDir, job));
  });
};