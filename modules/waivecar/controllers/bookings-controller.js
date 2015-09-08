'use strict';

let BookingService = require('../lib/booking-service');
let CarService     = require('../lib/car-service');
let queue          = Reach.provider('queue');
let error          = Reach.ErrorHandler;

Reach.Register.Controller('BookingsController', function (controller) {

  /**
   * Attempt to create a new booking using the provided information.
   * @method create
   * @param  {Object} post
   */
  controller.create = function *(post) {
    let carId = post.carId;
    let user  = this.auth.user;

    yield CarService.isAvailable(carId); // Is the car available for booking?
    yield CarService.hasDriver(user.id); // Is the user a driver of another car?

    let booking = yield BookingService.create(carId, user);
    yield CarService.setStatus('unavailable', carId, user);

    return booking;
  };

  /**
   * Fetches a list of bookings.
   *  This need to be ADMIN only
   * @method index
   * @param  {Object} options
   * @return {Array}
   */
  controller.index = function *(options) {
    return yield BookingService.getBookings(options);
  };

  /**
   * Fetch basic information about the booking.
   * @method show
   * @param  {Int} id The booking id
   * @return {Booking}
   */
  controller.show = function *(id) {
    return yield BookingService.getBooking(id, this.auth.user);
  };

  /**
   * Updates the booking state.
   * @method update
   * @param  {Int} id
   */
  controller.update = function *(id, post) {
    let user = this.auth.user;
    switch (post.state) {
      case 'pending-arrival' : return yield BookingService.pending(id, user);
      case 'start'           : return yield BookingService.start(id, user);
      case 'end'             : return yield BookingService.end(id, user);
      default:
        throw error.parse({
          code     : 'BOOKING_BAD_STATE',
          message  : 'The state provided is invalid',
          solution : 'Make sure the state provided with your request is a valid booking state'
        }, 403);
    }
  };

  /**
   * @method destroy
   * @param  {Int} id
   * @return {Booking}
   */
  controller.destroy = function *(id) {
    return yield BookingService.cancel(id, this.auth.user);
  };

  return controller;

});