'use strict';

let payment = Reach.module('payment');
let Booking = Reach.model('Booking');
let error   = Reach.ErrorHandler;

/**
 * @hook waivecar:before
 * @param {Object} data The hook data provided for payment
 */
payment.hook('waivecar:before', function *(data) {
  let booking = yield Booking.find(data.bookingId);
  if (!booking) {
    throw error.parse({
      code    : 'BOOKING_NOT_FOUND',
      message : 'The booking id provided does not exist in our records'
    }, 404);
  }
  if (booking.state !== 'pending-payment') {
    throw error.parse({
      code    : 'BOOKING_INVALID_STATE',
      message : 'You cannot submit a payment to a booking that is not pending payment'
    }, 409);
  }
  throw error.parse({}, 501);
});

/**
 * @hook waivecar
 * @param {Object} data   The hook data provided for payment
 * @param {Object} charge The stripe charge object
 */
payment.hook('waivecar', function *(data, charge) {
  
});