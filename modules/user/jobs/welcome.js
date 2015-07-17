'use strict';

let queue = Reach.service('queue');

queue.process('user-welcome', function (job, done) {
  done();
});