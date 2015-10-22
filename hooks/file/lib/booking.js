'use strict';

let shortid = require('shortid');
let Booking = Reach.model('Booking');
let error   = Reach.Error;

class BookingFile {
  
  /**
   * Validates the booking by verifying that it has been defined.
   * @param {Object} query
   */
  *validate(query) {
    let booking = yield Booking.findById(query.id);
    if (!booking) {
      throw error.parse({
        code    : `INVALID_BOOKING`,
        message : `The booking id provided does not exist.`
      }, 400);
    }
  }

  /**
   * Returns a collection id to assign to file.
   * @param  {Object} query
   * @return {String}
   */
  *collection(query) {
    let booking = yield Booking.findById(query.id);
    if (!booking.collectionId) {
      yield booking.update({
        collectionId : shortid.generate()
      });
    }
    return booking.collectionId;
  }

}

module.exports = new BookingFile();