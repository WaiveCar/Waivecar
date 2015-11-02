'use strict';

let co    = require('co');
let queue = Bento.provider('queue');
let Email = Bento.provider('email');
let log   = Bento.Log;

queue.process('email:user:request-email-verification', function (job, done) {
  if (Bento.ENV === 'test') { return done(); }
  log.debug('Sending request for email verification to : ' + job.data.to);
  co(function *() {
    let email = new Email();
    yield email.send(job.data);
    done();
  });
});