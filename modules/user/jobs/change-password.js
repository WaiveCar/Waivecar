'use strict';

let queue = Reach.service('queue');

queue.process('user-change-password', function (job, done) {
  done();
});