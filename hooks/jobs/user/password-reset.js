'use strict';

let co    = require('co');
let queue = Reach.provider('queue');
let Email = Reach.provider('email');
let log   = Reach.Log;

queue.process('email:user:password-reset', (job, done) => {
  if (Reach.ENV === 'test') { return done(); }
  log.debug('Sending password reset email to: ' + job.data.to);
  co(function *() {
    let email = new Email();
    yield email.send(job.data);
    done();
  });
});