'use strict';

let co    = require('co');
let queue = Bento.provider('queue');
let Sms   = Bento.provider('sms');
let log   = Bento.Log;

queue.process('sms:user:request-phone-verification', function(job, done) {
  log.debug('Sending request for phone verification to : ' + job.data.to);
  co(function *() {
    let message = new Sms();
    yield message.send(job.data);
    done();
  });
});
