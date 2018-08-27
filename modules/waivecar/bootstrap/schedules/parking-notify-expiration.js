'use strict';

let scheduler = Bento.provider('queue').scheduler;
let notify = require('../../lib/notification-service');

scheduler.process('parking-notify-expiration', function*(job) {
  console.log('job: ', job.data);
  console.log('parking space expiring');
  // This also needs to make tickets expire if there are any
  yield notify.slack({text: `parking space expiring`}, {channel: '#fleet'});
});
