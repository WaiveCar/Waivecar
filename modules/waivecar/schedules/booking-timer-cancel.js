'use strict';

let co      = require('co');
let Booking = require('../lib/booking');
let queue   = Reach.service('queue');
let socket  = Reach.Socket;

queue.process('booking-timer-cancel', function (job, done) {
  co(function *() {
    let id      = job.data.booking;
    let user    = job.data.user;
    let booking = yield Booking.getBooking(id, user);

    yield Booking.setCarStatus('available', booking.carId, user);

    booking.state = 'cancelled';
    yield booking.update();

    socket.io.user(user.id).emit('booking:cancelled', booking.toJSON());

    done();
  });
});

module.exports = function *() {
  yield queue.scheduler('booking-timer-cancel');
};