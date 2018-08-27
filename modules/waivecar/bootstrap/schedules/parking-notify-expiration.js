'use strict';

let scheduler = Bento.provider('queue').scheduler;
let notify = require('../../lib/notification-service');
let Ticket = Bento.model('Ticket');

scheduler.process('parking-notify-expiration', function*(job) {
  console.log('job: ', job.data);
  let {address, zone, notificationTime, car, carId} = job.data;
  console.log('parking space expiring');
  // This also needs to make tickets expire if there are any
  yield notify.slack(
    {
      text: `Parking space expiring: ${car} at ${address} in ${zone} in ${notificationTime} minutes`,
    },
    {channel: '#fleet'},
  );
});
