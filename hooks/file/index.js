'use strict';

let shortid        = require('shortid');
let FileModule     = Reach.module('file');
let bookingService = Reach.module('waivecar/lib/booking-service');
let licenseService = Reach.module('license/lib/license-service');
let hooks          = Reach.Hooks;
let error          = Reach.Error;

// ### Booking Hook

hooks.set('file:booking', {

  /**
   * Validate that the required record exists before attempting file upload.
   * @method validate
   * @param  {User} _user
   */
  validate : function *(_user) {
    let model = bookingService.getBooking(this.booking, _user);
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
    let booking = yield bookingService.getBooking(this.booking, _user);
    if (!booking.filesId) {
      yield booking.update({
        fileId : shortid.generate()
      });
    }
    return booking.filesId;
  }

});

// ### License Hook

hooks.set('file:license', {

  /**
   * Validate that the required record exists before attempting file upload.
   * @method validate
   * @param  {User} _user
   */
  validate : function *(_user) {
    let model = yield licenseService.get(this.license, _user);
    if (!model) {
      throw error.parse({
        code    : 'FILE_UPLOAD_FAILED',
        message : 'The license your are attempting to attach your image to does not exist'
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
    let license = yield licenseService.get(this.license, _user);
    if (!license.fileId) {
      yield license.update({
        fileId : shortid.generate()
      });
    }
    return license.fileId;
  }

});