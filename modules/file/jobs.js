'use strict';

let S3    = require('./classes/S3');
let queue = Reach.service('queue');

/* istanbul ignore next */

queue.process('S3 Upload', function (job, done) {
  S3.upload(job.data.files, job.data.bucket, done);
});