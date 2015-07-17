'use strict';

let queue = Reach.service('queue');

queue.process('user-change-email', function (job, done) {
  done();
});