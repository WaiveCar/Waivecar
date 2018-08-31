'use strict';

let scheduler = Bento.provider('queue').scheduler;
let notify = require('../../lib/notification-service');
let Ticket = Bento.model('Ticket');
let Car       = Bento.model('Car');
let User      = Bento.model('User');

scheduler.process('parking-notify-expiration', function*(job) {
  let {bookingId, userId, address, zone, notificationTime, carId} = job.data;

  let car = yield Car.findById(carId);
  let user = yield User.findById(userId);
  let booking = yield Booking.findById(bookingId);

  if(address) {
    address = "at " + address;
  } else {
    address = '';
  }

  yield notify.slack(
    {
      text: `:memo: ${ car.link() } after ${ booking.link() } by ${ user.link() } expiring ${address} in ${zone} in ${notificationTime} minutes`,
    },
    {channel: '#rental-alerts'},
  );
});
