'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');
let notify = require('../../lib/notification-service');

scheduler.process('notify-of-movement', function*(job) {
  console.log('job', job.data);
  console.log('notify of movement process started');
});
