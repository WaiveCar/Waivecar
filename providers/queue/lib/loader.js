'use strict';

let fs    = require('fs');
let path  = require('path');
let queue = Bento.provider('queue');
let log   = Bento.Log;

module.exports = (jobsDir) => {
  if (!queue) {
    log.silent('error')('Queue is missing [queue] in api configuration');
    return;
  }

  if (!fs.existsSync(jobsDir)) {
    log.silent('warn')(` - Queue: Could not find jobs folder [${ jobsDir }]`);
    return;
  }

  let jobs = fs.readdirSync(jobsDir);
  jobs.forEach((job) => {
    require(path.join(jobsDir, job));
  });
};
