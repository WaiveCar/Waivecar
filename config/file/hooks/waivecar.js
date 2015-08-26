'use strict';

let shortid        = require('shortid');
let FileModule     = Reach.module('file');
let bookingHandler = Reach.module('waivecar/lib/booking-handler');

FileModule.hook('waivecar', {

  /**
   * Validate that the required record exists before attempting file upload.
   * @method validate
   * @param  {User} _user
   */
  validate : function *(_user) {
    let model = bookingHandler.getBooking(this.booking, _user);
    if (!model) {
      throw error.parse({
        code    : 'FILE_UPLOAD_FAILED',
        message : 'The booking id provided for file upload does not exist'
      }, 400);
    }
  },

  /**
   * Create a shared collection id for files that belongs to a single record.
   * @method collection
   * @param  {User} _user
   * @return {String}
   */
  collection : function *(_user) {
    let booking = yield bookingHandler.getBooking(this.booking, _user);
    if (!booking.filesId) {
      booking.filesId = shortid.generate();
      yield booking.update();
    }
    return booking.filesId;
  }

});