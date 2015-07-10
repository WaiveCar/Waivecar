'use strict';

let queue = Reach.service('queue');
let log   = Reach.Logger;

if ('test' !== Reach.ENV) { // We don't need this running during testing

  // ### Fleet Process

  queue.process('Vehicle Reconcile Fleet', function (job, done) {
    console.log('Reconcile Fleet');
    done();
  });

  // ### Start Interval

  setInterval(function () {
    queue
      .create('Vehicle Reconcile Fleet', {})
      .removeOnComplete(true)
      .save(function (err) {
        if (err) {
          log.error('Sample Job: Error', err);
        }
      })
    ;
  }, 60 * 1000);

}