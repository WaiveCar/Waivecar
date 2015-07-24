'use strict';

let Booking = require('../lib/booking');
let error   = Reach.ErrorHandler;

module.exports = (function () {

  /**
   * @class BookingsController
   */
  function BookingsController() {}

  /**
   * Attempt to create a new booking using the provided information.
   * @method create
   * @param  {Object} post
   */
  BookingsController.prototype.create = function *(post) {
    let carId = post.carId;
    let user  = this.auth.user;

    // ### Check
    // First we want to check if the selected car is available for booking
    // Once that is confirmed we check if the user is available for a new
    // booking or if they are already in another active booking.

    yield Booking.isCarAvailable(carId);
    yield Booking.isUserAvailable(user.id);

    // ### Create Booking

    let booking = yield Booking.create(carId, user);

    // ### Update Car Status
    // Set the booked car to unavailable and assign the user as the driver.

    yield Booking.setCarStatus('unavailable', carId, user);

    // ### Booking Details
    // Send booking details back to the client.

    return booking;
  };

  /**
   * Fetches a list of bookings.
   *  This need to be ADMIN only
   * @method index
   * @return {Array} returns an array of Bookings
   */
  BookingsController.prototype.index = function *(query) {
    return yield Booking.getBookings(query);
  };

  /**
   * Fetch basic information about the booking.
   * @method show
   * @param  {Int} id The booking id
   * @return {Booking}
   */
  BookingsController.prototype.show = function *(id) {
    let booking         = yield Booking.getBooking(id, this.auth.user);
        booking         = booking.toJSON();
        booking.details = yield Booking.getBookingDetails(id);
    return booking;
  };

  /**
   * Set the booking state to pending arrival.
   * @method pendingArrival
   * @param  {Int} id
   */
  BookingsController.prototype.pendingArrival = function *(id) {
    let booking = yield Booking.getBooking(id, this.auth.user);

    if ('pending-arrival' === booking.state) {
      throw error.parse({
        code    : 'BOOKING_INVALID_ACTION',
        message : 'This booking is already in pending arrival state'
      }, 409);
    }

    yield booking.update({
      state : 'pending-arrival'
    });

    // Start 15 minute arrival timer

    return booking;
  };

  /**
   * Start the ride.
   * @method start
   * @param  {Int} id
   */
  BookingsController.prototype.start = function *(id) {
    let user    = this.auth.user;
    let booking = yield Booking.getBooking(id, user);

    if ('pending-arrival' !== booking.state) {
      throw error.parse({
        code    : 'BOOKING_INVALID_ACTION',
        message : 'This action can only be performed when pending arrival'
      }, 409);
    }

    yield Booking.start(booking, user);

    // Remove 15 minute arrival timer

    return booking;
  };

  /**
   * End the ride.
   * @method end
   * @param  {Int} id
   */
  BookingsController.prototype.end = function *(id) {
    let user    = this.auth.user;
    let booking = yield Booking.getBooking(id, user);

    if ('in-progress' !== booking.state) {
      throw error.parse({
        code    : 'BOOKING_INVALID_ACTION',
        message : 'You can only end a ride that is in progress'
      }, 409);
    }

    yield Booking.end(booking, user);

    return booking;
  };

  /**
   * Attempts to cancel the booking, can only be done before the ride has started.
   * @method cancel
   * @param  {Int} id
   */
  BookingsController.prototype.cancel = function *(id) {
    let user    = this.auth.user;
    let booking = yield Booking.getBooking(id, user);

    if ('in-progress' === booking.state || 'completed' === booking.state || 'cancelled' === booking.state) {
      throw error.parse({
        code     : 'BOOKING_INVALID_ACTION',
        message  : 'You cannot cancel a booking which is already ' + booking.state.replace('-', ' '),
        solution : 'cancelled' === booking.state ? undefined : 'Use the end ride feature to end your booking'
      }, 409);
    }

    yield Booking.setCarStatus('available', booking.carId, user);
    yield booking.update({
      state : 'cancelled'
    });

    return booking;
  };

  return BookingsController;

})();