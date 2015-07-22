'use strict';

let queue     = Reach.service('queue');
let Booking   = Reach.model('Booking');
let Car       = Reach.model('Car');
let CarStatus = Reach.model('CarStatus');
let error     = Reach.ErrorHandler;

/**
 * @class Booking
 * @static
 */
let Bookings = module.exports = {};

/**
 * @method create
 * @method {String} carId
 * @method {Object} user
 */
Bookings.create = function *(carId, user) {
  yield isCarAvailable(carId);
  yield isUserValid(user.id);

  let booking = new Booking({
    carId      : carId,
    customerId : user.id,
    state      : 'new-booking'
  });
  booking._actor = user;
  yield booking.save();

  let status = new CarStatus({
    carId    : carId,
    driverId : user.id,
    status   : 'unavailable'
  });
  yield status.upsert();

  return booking;
};

/**
 * @class pendingArrival
 * @param {Int}    bookingId
 * @param {Object} user
 */
Bookings.pendingArrival = function *(bookingId, user) {
  let booking        = yield Booking.find(bookingId);
      booking._actor = user;

  yield booking.update({
    state : 'pending-arrival'
  });

  // Start 15 minute counter to automatic cancellation

  return booking;
};

/**
 * @class start
 * @param {Int}    bookingId
 * @param {Object} user
 */
Bookings.start = function *(bookingId, user) {
  let booking        = yield Booking.find(bookingId);
      booking._actor = user;

  yield booking.update({
    state : 'in-progress'
  });

  // Remove 15 minute counter to automatic cancellation

  return booking;
};

/**
 * @class cancel
 * @param {Int}    bookingId
 * @param {Object} user
 */
Bookings.cancel = function *(bookingId, user) {
  let booking        = yield Booking.find(bookingId);
      booking._actor = user;

  if ('in-progress' === booking.state || 'completed' === booking.state) {
    throw error.parse({
      code    : 'BOOKING_CANNOT_CANCEL',
      message : 'You cannot cancel a booking which is already ' + booking.state.replace('-', ' ')
    }, 409);
  }

  let status = yield CarStatus.find({ where : { driverId : user.id }, limit : 1 });
  if (status) {
    status._actor = user;
    yield status.update({
      driverId : null,
      status   : 'available'
    }, 'carId');
  }

  yield booking.update({
    state : 'cancelled'
  });

  return booking;
};

/**
 * Checks if the user can create a new booking.
 * @private
 * @method isUserValid
 * @param  {Int} id
 */
function *isUserValid(id) {
  let count = yield CarStatus.count({ driverId : id });
  if (0 !== count) {
    throw error.parse({
      code    : 'CAR_IN_PROGRESS',
      message : 'You are already assigned to another waivecar'
    }, 409);
  }
}

/**
 * @private
 * @method isCarAvailable
 * @param  {String} id
 */
function *isCarAvailable(id) {
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
}