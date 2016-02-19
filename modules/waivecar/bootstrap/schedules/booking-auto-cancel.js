'use strict';

let notify    = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;
let Booking   = Bento.model('Booking');
let Car       = Bento.model('Car');
let log       = Bento.Log;
let relay     = Bento.Relay;
let error     = Bento.Error;

scheduler.process('booking-auto-cancel', function *(job) {
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

    yield notify.notifyAdmins(`The booking with ${ car.license || car.id } was automatically cancelled, after their 15 minute timer expired.`, [ 'slack' ]);

    log.info(`The booking with ${ car.license || car.id } was automatically cancelled, booking status was '${ booking.status }'.`);
  } else {
    log.warn(`Auto cancellation of booking ${ booking.id } was request but ignored | Booking status: ${ booking.status }`);
  }
});

module.exports = function *() {
  scheduler('booking-auto-cancel');
};
