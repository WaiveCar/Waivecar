'use strict';

let notify    = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;
let Booking   = Bento.model('Booking');
let Car       = Bento.model('Car');
let log       = Bento.Log;
let relay     = Bento.Relay;
let error     = Bento.Error;

scheduler.process('booking-auto-cancel', function *(job) {
  let timeWindow = 15;
  let booking = yield Booking.findOne({ where : { id : job.data.bookingId } });
  if (!booking) {
    throw error.parse({
      code    : 'BOOKING_AUTO_CANCEL_FAILED',
      message : 'Could not find a booking with the provided id'
    });
  }

  if (booking.status === 'reserved') {

    // ### Cancel Booking

    yield booking.update({
      status : 'cancelled'
    });

    // ### Update Car
    // Remove the user from the car and make it available again.

    let car = yield Car.findById(booking.carId);
    yield car.update({
      userId      : null,
      isAvailable : true
    });

    // ### Emit Event
    // Sends the cancelled event to the user and administrators.

    relay.user(booking.userId, 'bookings', {
      type : 'update',
      data : booking.toJSON()
    });

    relay.admin('bookings', {
      type : 'update',
      data : booking.toJSON()
    });

    let user = yield notify.sendTextMessage(booking.userId, `Hi, sorry you couldn't make it to your car on time. Your ${ timeWindow } minutes have expired and we've had to cancel your reservation for ${ car.info() }`);
    yield notify.notifyAdmins(`:timer_clock: ${ user.name() } ${ car.info() } booking cancelled after ${ timeWindow } minute timer expiration.`, [ 'slack' ], { channel : '#reservations' });

    log.info(`The booking with ${ car.info() } was automatically cancelled, booking status was '${ booking.status }'.`);
  } else {
    log.warn(`Auto cancellation of booking ${ booking.id } was request but ignored | Booking status: ${ booking.status }`);
  }
});

module.exports = function *() {
  scheduler('booking-auto-cancel');
};
