'use strict';

let queue = Reach.service('queue');

queue.process('user password', function (job, done) {
  console.log(job);
  done();
});