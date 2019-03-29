'use strict';

let scheduler = Bento.provider('queue').scheduler;
let notify = require('../../lib/notification-service');
let Tikd = require('../../lib/tikd-service');
let Ticket = Bento.model('Ticket');
let Car       = Bento.model('Car');
let User      = Bento.model('User');
let Booking   = Bento.model('Booking');

scheduler.process('user-liability-release', function*(job) {
  let {bookingId, userId, carId} = job.data;

  let car = yield Car.findById(carId);
  let booking = yield Booking.findById(bookingId);
  let user = yield User.findById(userId);

  yield Tikd.removeLiability(car, booking, user);
});

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
    { text: `:memo: ${ car.link() } after ${ booking.link() } by ${ user.link() } expiring ${address} in ${zone} in ${notificationTime} minutes` },
    {channel: '#rental-alerts'},
  );
});
