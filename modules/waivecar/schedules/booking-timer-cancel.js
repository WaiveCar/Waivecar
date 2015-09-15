'use strict';

let Booking   = require('../lib/booking-service');
let scheduler = Reach.provider('queue').scheduler;
let io        = Reach.IO;

scheduler.process('booking-timer-cancel', function *(job) {
  let id      = job.data.booking;
  let user    = job.data.user;
  let booking = yield Booking.getBooking(id, user);
  yield Booking.setCarStatus('available', booking.carId, user);
  yield booking.update({
    state : 'cancelled'
  });
  io.user(user.id).emit('booking:cancelled', booking.toJSON());
});

module.exports = function *() {
  scheduler('booking-timer-cancel');
};