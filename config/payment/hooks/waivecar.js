'use strict';

let PaymentModule = Reach.module('payment');
let Booking       = Reach.model('Booking');
let Payment       = Reach.model('Payment');
let error         = Reach.ErrorHandler;

PaymentModule.hook('waivecar', {

  /**
   * @method preload
   * @param {Object}  data The hook data provided for payment
   * @param {User}    user The user attempting to perform the payment
   * @param {Boolean} type Is this a new charge or a capture request
   */
  preload : function *(data, user, isNew) {
    let booking = yield Booking.find(data.bookingId);
    if (!booking) {
      throw error.parse({
        code    : 'BOOKING_NOT_FOUND',
        message : 'The booking id provided does not exist in our records'
      }, 404);
    }
    if (booking.state !== 'new-booking' && booking.state !== 'pending-payment') {
      throw error.parse({
        code    : 'BOOKING_INVALID_STATE',
        message : 'You cannot submit a payment to a booking that is not a new booking or pending payment'
      }, 400);
    }
    if (booking.customerId !== user.id) {
      throw error.parse({
        code    : 'BOOKING_INVALID_USER',
        message : 'You cannot submit payments belonging to another customer'
      }, 400);
    }
    if (booking.paymentId) {
      let payment = yield Payment.find(booking.paymentId);
      if (payment && (isNew || payment.captured === 1)) {
        throw error.parse({
          code     : 'PAYMENT_INVALID',
          message  : 'The payment for this booking has already been processed',
          solution : 'Send a request to /payments/'+ payment.id + ' to view payment details'
        }, 400);
      }
    }
  },

  /**
   * @method authenticate
   * @param {Object}  data    The hook data provided for payment
   * @param {Payment} payment The stripe charge object
   */
  authenticate: function *(data, payment) {
    let booking       = yield Booking.find(data.bookingId);
    booking.paymentId = payment.id;
    booking.state     = 'payment-authorized';
    yield booking.update();
  },

  /**
   * @method capture
   * @param {Object}  data    The hook data provided for payment
   * @param {Payment} payment The stripe charge object
   */
  capture: function *(data, payment) {
    let booking       = yield Booking.find(data.bookingId);
    booking.paymentId = payment.id;
    booking.state     = 'completed';
    yield booking.update();
  }

});