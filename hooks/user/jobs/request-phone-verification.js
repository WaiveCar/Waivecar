'use strict';

let co    = require('co');
let queue = Reach.provider('queue');
let Sms   = Reach.provider('sms');
let log   = Reach.Log;

queue.process('sms:user:request-phone-verification', function (job, done) {
  if (Reach.ENV === 'test') { return done(); }
  log.debug('Sending request for phone verification to : ' + job.data.to);
  co(function *() {
    let message = new Sms();
    yield message.send(job.data);
    done();
  });
});