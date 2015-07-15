'use strict';

let queue = Reach.service('queue');

queue.process('user registration', function (job, done) {
  console.log(job);
  done();
});