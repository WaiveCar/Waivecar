'use strict';

let co    = require('co');
let queue = Bento.provider('queue');
let Email = Bento.provider('email');
let log   = Bento.Log;

queue.process('email:user:registration', function process(job, done) {
  if (Bento.ENV === 'test') { return done(); }
  log.debug('Sending user welcome email to: ' + job.data.to);
  co(function *() {
    let email = new Email();
    yield email.send(job.data);
    done();
  });
});
