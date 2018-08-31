'use strict';

let scheduler = Bento.provider('queue').scheduler;
let notify = require('../../lib/notification-service');
let Ticket = Bento.model('Ticket');

scheduler.process('parking-notify-expiration', function*(job) {
  let {address, zone, notificationTime, car, carId} = job.data;
  if(address) {
    address = "at " + address;
  } else {
    address = '';
  }
  yield notify.slack(
    {
      text: `:memo: Parking space expiring: ${car.link()} ${address} in ${zone} in ${notificationTime} minutes`,
    },
    {channel: '#rental-alerts'},
  );
});
