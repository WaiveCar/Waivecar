'use strict';

let queue = Reach.service('queue');

queue.process('user email', function (job, done) {
  console.log(job);
  done();
});