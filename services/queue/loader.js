'use strict';

var fs    = require('fs');
var path  = require('path');
var queue = Reach.service('queue');

module.exports = function (jobsDir) {
  if (!queue) {
    Reach.Logger.silent('error')('Queue is missing [queue] in api configuration');
    return;
  }

  if (!fs.existsSync(jobsDir)) {
    Reach.Logger.silent('warn')(' - Queue: Could not find jobs folder [%s]', jobsDir);
    return;
  }

  let jobs = fs.readdirSync(jobsDir);
  jobs.forEach(function (job) {
    require(path.join(jobsDir, job));
  });
};