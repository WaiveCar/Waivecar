'use strict';

let PaymentModule = Reach.module('payment');
let Booking       = Reach.model('Booking');
let Payment       = Reach.model('Payment');
let error         = Reach.ErrorHandler;

/**
 * @hook waivecar:before
 * @param {Object} data The hook data provided for payment
 * @param {User}   user The user attempting to perform the payment
 */
PaymentModule.hook('waivecar:before', function *(data, user) {
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
  if (booking.customerId !== user.id) {
    throw error.parse({
      code    : 'BOOKING_INVALID_USER',
      message : 'You cannot submit payments belonging to another customer'
    }, 409);
  }
  if (booking.paymentId) {
    let payment = yield Payment.find(booking.paymentId);
    if (payment) {
      throw error.parse({
        code     : 'PAYMENT_INVALID',
        message  : 'The payment for this booking has already been processed',
        solution : 'Send a request to /payments/'+ payment.id + ' to view payment details'
      }, 409);
    }
  }
});

/**
 * @hook waivecar
 * @param {Object} data   The hook data provided for payment
 * @param {Object} charge The stripe charge object
 */
PaymentModule.hook('waivecar', function *(data, charge) {
  let booking       = yield Booking.find(data.bookingId);
  booking.paymentId = charge.id;
  booking.state     = 'completed';
  yield booking.update();
});