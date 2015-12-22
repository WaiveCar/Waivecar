'use strict';

let BookingPayment = Bento.model('BookingPayment');

module.exports = {

  /**
   * Stores a booking payment.
   * @param  {Number} orderId
   * @param  {Number} bookingId
   * @return {Void}
   */
  *store(orderId, bookingId) {
    let payment = new BookingPayment({
      bookingId : bookingId,
      orderId   : orderId
    });
    yield payment.save();
  }

};
