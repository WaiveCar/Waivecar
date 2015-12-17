'use strict';

let booking = require('../lib/booking-service');
let error   = Bento.Error;

Bento.Register.Controller('BookingsController', function(controller) {

  /**
   * Creates a new booking request.
   * @return {Object}
   */
  controller.create = function *() {
    return yield booking.create(this.payload, this.auth.user);
  };

  /**
   * Returns a list of bookings.
   * @return {Object}
   */
  controller.index = function *() {
    return yield booking.index(this.query, this.auth.user);
  };

  /**
   * Returns a single booking.
   * @param  {Number} id
   * @return {Object}
   */
  controller.show = function *(id) {
    return yield booking.show(id, this.auth.user);
  };

  /**
   * Initiates the booking and starts the ride.
   * @param  {Number} id
   * @param  {String} action
   * @return {Object}
   */
  controller.update = function *(id, action) {
    switch (action) {
      case 'start'    : return yield booking.start(id, this.auth.user);
      case 'ready'    : return yield booking.ready(id, this.auth.user);
      case 'end'      : return yield booking.end(id, this.auth.user);
      case 'complete' : return yield booking.complete(id, this.auth.user);
      case 'close'    : return yield booking.close(id, this.auth.user);
      default : {
        throw error.parse({
          code    : `BOOKING_INVALID_ACTION`,
          message : `'${ action }' is not a valid booking action.`
        }, 400);
      }
    }
  };

  /**
   * Cancels a booking.
   * @param  {Number} id
   * @return {Object}
   */
  controller.cancel = function *(id) {
    return yield booking.cancel(id, this.auth.user);
  };

  return controller;

});
