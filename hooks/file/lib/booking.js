'use strict';

let shortid = require('shortid');
let Booking = Bento.model('Booking');
let error   = Bento.Error;

module.exports = class BookingFile {
  
  /**
   * Validates the booking by verifying that it has been defined.
   * @param {Number} bookingId
   */
  static *validate(bookingId) {
    let booking = yield Booking.findById(bookingId);
    if (!booking) {
      throw error.parse({
        code    : `INVALID_BOOKING`,
        message : `The booking id provided does not exist.`
      }, 400);
    }
  }

  /**
   * Returns a collection id to assign to file.
   * @param  {Number} bookingId
   * @return {String}
   */
  static *collection(bookingId) {
    let booking = yield Booking.findById(bookingId);
    if (!booking.collectionId) {
      yield booking.update({
        collectionId : shortid.generate()
      });
    }
    return booking.collectionId;
  }

}