'use strict';

let bookingService = Bento.module('waivecar/lib/booking-service');
let Booking        = Bento.model('Booking');
let BookingPayment = Bento.model('BookingPayment');

module.exports = {

  /**
   * Stores a booking payment.
   * @param  {Number} orderId
   * @param  {Number} bookingId
   * @return {Void}
   */
  *store(orderId, bookingId, _user) {
    let booking = yield Booking.findById(bookingId);
    let payment = new BookingPayment({
      bookingId : bookingId,
      orderId   : orderId
    });
    yield payment.save();
    yield booking.close();
    yield bookingService.relay('update', booking.id, _user);
  }

};
