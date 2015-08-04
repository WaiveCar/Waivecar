'use strict';

let Booking = require('../lib/booking');
let queue   = Reach.service('queue');
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
  BookingsController.prototype.update = function *(id, post) {
    let user = this.auth.user;
    switch (post.state) {
      case 'cancel'          : return yield Booking.setCancelled(id, user);
      case 'pending-arrival' : return yield Booking.setPendingArrival(id, user);
      case 'start'           : return yield Booking.setInProgress(id, user);
      case 'end'             : return yield Booking.setPendingPayment(id, user);
      default:
        throw error.parse({
          code     : 'BOOKING_BAD_STATE',
          message  : 'The state provided is invalid',
          solution : 'Make sure the state provided with your request is a valid booking state'
        }, 403);
    }
  };

  return BookingsController;

})();