'use strict';

let shortid        = require('shortid');
let FileModule     = Reach.module('file');
let bookingHandler = Reach.module('waivecar/lib/booking-handler');

FileModule.hook('waivecar', {

  /**
   * Validates the booking and returns a custom identifier for the file.
   * @method cid
   * @param  {User}   user
   * @param  {Object} data
   */
  cid : function *(user, data) {
    let booking = yield bookingHandler.getBooking(data.booking, user);
    if (!booking.filesId) {
      booking.filesId = shortid.generate();
      yield booking.update();
    }
    return booking.filesId;
  }

});