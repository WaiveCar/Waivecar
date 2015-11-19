'use strict';

let shortid        = require('shortid');
let Booking        = Bento.model('Booking');
let BookingPayment = Bento.model('BookingPayment');
let error          = Bento.Error;

module.exports = class BookingService {

  /**
   * Validates a booking by its id.
   * @param {Number} bookingId
   */
  static *validate(bookingId) {
    let booking = yield Booking.findById(bookingId);

    // ### Validate Booking

    if (!booking) {
      throw error.parse({
        code    : `BOOKING_NOT_FOUND`,
        message : `The booking for this payment request does not exist.`
      }, 400);
    }

    // ### Validate Booking State

    if (booking.status !== 'new-booking' && booking.status !== 'pending-payment') {
      throw error.parse({
        code     : `INVALID_PAYMENT_REQUEST`,
        message  : `The payment request was made on a booking with an invalid payment state.`,
        solution : `Make sure the booking is either 'new-booking' or 'pending-payment'`,
        data     : {
          status : booking.status
        }
      }, 400);
    }
  }

  /**
   * Adds payment authorized state to booking and creates a new
   * local booking payment record.
   * @param {Number} bookingId
   * @param {String} paymentId
   */
  static *authorized(bookingId, paymentId) {
    let booking = yield Booking.findById(bookingId);
    yield booking.update({
      status : 'payment-authorized'
    });

    // ### Create Payment

    let bookingPayment = new BookingPayment({
      bookingId : bookingId,
      paymentId : paymentId
    });
    yield bookingPayment.save();
  }

  /**
   * Sets the booking state to complete upon completed payment.
   * @param  {Number} bookingId
   */
  static *completed(bookingId) {
    let booking = yield Booking.findById(bookingId);
    yield booking.update({
      status : 'completed'
    });
  }

};
