'use strict';

let moment         = require('moment');
let Booking        = Reach.model('Booking');
let BookingDetails = Reach.model('BookingDetails');
let Car            = Reach.model('Car');
let CarStatus      = Reach.model('CarStatus');
let error          = Reach.ErrorHandler;

/**
 * @class Booking
 * @static
 */
let Bookings = module.exports = {};

// ### Booking Methods

/**
 * Creates a new booking with the assigned car and customer.
 * @method create
 * @param  {String} car
 * @param  {Object} customer
 * @return {Booking}
 */
Bookings.create = function *(car, customer) {
  let booking = new Booking({
    carId      : car,
    customerId : customer.id,
    state      : 'new-booking'
  });
  booking._actor = customer;
  yield booking.save();
  return booking;
};

/**
 * Starts the booking logging location, time, odometer and charge level.
 * @method start
 * @param  {Booking} booking
 * @param  {User}    user
 */
Bookings.start = function *(booking, user) {
  let details = new BookingDetails({
    bookingId : booking.id,
    type      : 'start',
    time      : moment().format('YYYY-MM-DD HH-mm-ss'),
    latitude  : '37.645972',
    longitude : '-122.426251',
    odometer  : 28000,
    charge    : 78
  });
  details._actor = user;
  yield details.save();
  yield booking.update({
    state : 'in-progress'
  });
};

/**
 * Ends a booking logging location, time, odometer and charge level.
 * @method start
 * @param  {Booking} booking
 * @param  {User}    user
 */
Bookings.end = function *(booking, user) {
  let details = new BookingDetails({
    bookingId : booking.id,
    type      : 'end',
    time      : moment().add(1, 'hour').format('YYYY-MM-DD HH-mm-ss'),
    latitude  : '37.764566',
    longitude : '-122.496265',
    odometer  : 28010,
    charge    : 48
  });
  details._actor = user;

  // ### Details
  // Save the car details at the end of the ride.

  yield details.save();

  // ### Update Booking
  // Set the booking to pending payment, a future payment job will update the
  // booking to completed at earliest convenience.

  yield booking.update({
    state : 'pending-payment'
  });

  // ### Car Status
  // Set the car status back to available.

  yield this.setCarStatus('available', booking.carId, user);
};

/**
 * Returns a booking based on the provided booking and user.
 * @private
 * @method getBooking
 * @param  {String}  id
 * @param  {Object}  user
 * @return {Booking} res
 */
Bookings.getBooking = function *(id, user) {
  let booking = yield Booking.find({
    where : {
      id         : id,
      customerId : user.id
    },
    limit : 1
  });
  if (!booking) {
    throw error.parse({
      code    : 'BOOKING_INVALID_USER',
      message : 'You do not have access to the provided booking'
    }, 409);
  }
  booking._actor = user;
  return booking;
};

/**
 * Returns a list of details for the given booking.
 * @method getBookingDetails
 * @param  {Int} id
 * @return {BookingDetails}
 */
Bookings.getBookingDetails = function *(id) {
  return yield BookingDetails.find({
    where : {
      bookingId : id
    }
  });
};

// ### Customer Methods

/**
 * Check if the user is available to create a new booking, if a user is
 * already in another car then we cannot create a new booking.
 * @private
 * @method isUserAvailable
 * @param  {Int} id
 */
Bookings.isUserAvailable = function *(id) {
  let count = yield CarStatus.count({ driverId : id });
  if (0 !== count) {
    throw error.parse({
      code    : 'CAR_IN_PROGRESS',
      message : 'You are already assigned to another waivecar'
    }, 409);
  }
};

// ### Car Methods

/**
 * @method isCarAvailable
 * @param  {String} id
 */
Bookings.isCarAvailable = function *(id) {
  let count = yield Car.count({ id : id });
  if (0 === count) {
    throw error.parse({
      code    : 'CAR_INVALID',
      message : 'The requested car does not exist'
    }, 409);
  }
  let state  = yield CarStatus.find({ where : { carId : id }, limit : 1 });
  if (state && 'unavailable' === state.status) {
    throw error.parse({
      code    : 'CAR_UNAVAILABLE',
      message : 'The selected car is unavailable for booking'
    }, 409);
  }
};

/**
 * @method setCarStatus
 * @param  {String} status
 * @param  {String} car
 * @param  {Object} user
 */
Bookings.setCarStatus = function *(status, car, user) {
  let carStatus = null;
  switch (status) {
    case 'unavailable':
      carStatus = new CarStatus({
        carId    : car,
        driverId : user.id,
        status   : status
      });
      yield carStatus.upsert();
      break;
    case 'available':
      carStatus        = yield CarStatus.find({ where : { carId : car }, limit : 1 });
      carStatus._actor = user;
      yield carStatus.update({
        driverId : null,
        status   : status
      }, 'carId');
      break;
    default:
      throw error.parse({
        code     : 'BOOKING_BAD_STATUS',
        message  : 'You must set a valid booking status',
        solution : 'Check callers of the setCarStatus method on Bookings class and make sure it is setting valid states'
      });
  }
};