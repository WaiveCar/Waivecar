'use strict';

let bookingHandler = require('../lib/booking-handler');
let carHandler     = require('../lib/car-handler');
let queue          = Reach.service('queue');
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

    yield carHandler.isAvailable(carId); // Is the car available for booking?
    yield carHandler.hasDriver(user.id); // Is the user a driver of another car?

    let booking = yield bookingHandler.create(carId, user);
    yield carHandler.setStatus('unavailable', carId, user);

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
    return yield bookingHandler.getBookings(options);
  };

  /**
   * Fetch basic information about the booking.
   * @method show
   * @param  {Int} id The booking id
   * @return {Booking}
   */
  controller.show = function *(id) {
    let booking = yield bookingHandler.getBooking(id, this.auth.user);

    booking         = booking.toJSON();
    booking.details = yield bookingHandler.getBookingDetails(id);

    return booking;
  };

  /**
   * Updates the booking state.
   * @method update
   * @param  {Int} id
   */
  controller.update = function *(id, post) {
    let user = this.auth.user;
    switch (post.state) {
      case 'cancel'  : return yield bookingHandler.cancel(id, user);
      case 'pending' : return yield bookingHandler.pending(id, user);
      case 'start'   : return yield bookingHandler.start(id, user);
      case 'end'     : return yield bookingHandler.end(id, user);
      default:
        throw error.parse({
          code     : 'BOOKING_BAD_STATE',
          message  : 'The state provided is invalid',
          solution : 'Make sure the state provided with your request is a valid booking state'
        }, 403);
    }
  };

  return controller;

});