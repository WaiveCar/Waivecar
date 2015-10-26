'use strict';

let shortid        = require('shortid');
let Booking        = Reach.model('Booking');
let BookingPayment = Reach.model('BookingPayment');
let error          = Reach.Error;

module.exports = class BookingService {

  /**
   * Validates a booking by its id.
   * @param {Number} bookingId
   */
  static *validate(bookingId) {
    let booking = yield Booking.findById(bookingId);
    if (!booking) {
      throw error.parse({
        code    : `BOOKING_NOT_FOUND`,
        message : `The booking for this payment request does not exist.`
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
  static *paid(bookingId) {
    let booking = yield Booking.findById(bookingId);
    yield booking.update({
      status : 'completed'
    });
  }

}