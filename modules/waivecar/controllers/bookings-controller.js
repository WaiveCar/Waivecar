'use strict';

let booking = require('../lib/booking-service');

Bento.Register.Controller('BookingsController', function (controller) {

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
    return yield booking.index(this.query, this.auth.role, this.auth.user);
  };

  /**
   * Returns a single booking.
   * @param  {Number} id The booking ID.
   * @return {Object}
   */
  controller.show = function *(id) {
    return yield booking.show(id, this.auth.user);
  };

  /**
   * Initiates the booking and starts the ride.
   * @param  {Number} id The booking ID.
   * @return {Object}
   */
  controller.start = function *(id) {
    return yield booking.start(id, this.auth.user);
  };

  /**
   * Ends the current ride.
   * @param  {Number} id The booking ID.
   * @return {Object}
   */
  controller.end = function *(id) {
    return yield booking.end(id, this.payload.paymentId, this.auth.user);
  };

  /*
  controller.destroy = function *(id) {
    return yield BookingService.cancel(id, this.auth.user);
  };
  */

  return controller;

});