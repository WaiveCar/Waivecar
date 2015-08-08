'use strict';

let Booking = require('../lib/booking');
let car     = require('../lib/car-handler');
let queue   = Reach.service('queue');
let error   = Reach.ErrorHandler;

Reach.Register.Controller('BookingsController', function (controller) {

  /**
   * Attempt to create a new booking using the provided information.
   * @method create
   * @param  {Object} post
   */
  controller.create = function *(post) {
    let carId = post.carId;
    let user  = this.auth.user;

    yield car.isAvailable(carId); // Is the car available for booking?
    yield car.hasDriver(user.id); // Is the user a driver of another car?

    let booking = yield Booking.create(carId, user);
    yield car.setStatus('unavailable', carId, user);

    return booking;
  };

  /**
   * Fetches a list of bookings.
   *  This need to be ADMIN only
   * @method index
   * @return {Array} returns an array of Bookings
   */
  controller.index = function *(query) {
    return yield Booking.getBookings(query);
  };

  /**
   * Fetch basic information about the booking.
   * @method show
   * @param  {Int} id The booking id
   * @return {Booking}
   */
  controller.show = function *(id) {
    let booking = yield Booking.getBooking(id, this.auth.user);

    booking         = booking.toJSON();
    booking.details = yield Booking.getBookingDetails(id);

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
      case 'cancel'  : return yield Booking.setCancelled(id, user);
      case 'pending' : return yield Booking.setPendingArrival(id, user);
      case 'start'   : return yield Booking.setInProgress(id, user);
      case 'end'     : return yield Booking.setPendingPayment(id, user);
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