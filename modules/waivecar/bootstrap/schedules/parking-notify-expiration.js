'use strict';

let scheduler = Bento.provider('queue').scheduler;
let notify = require('../../lib/notification-service');
let Ticket = Bento.model('Ticket');

scheduler.process('parking-notify-expiration', function*(job) {
  let {address, zone, notificationTime, car, carId} = job.data;
  yield notify.slack(
    {
      text: `Parking space expiring: ${car} at ${address} in ${zone} in ${notificationTime} minutes`,
    },
    {channel: '#fleet'},
  );
});
