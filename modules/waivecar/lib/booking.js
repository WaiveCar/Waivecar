'use strict';

let moment         = require('moment');
let queue          = Reach.service('queue');
let q              = Reach.service('mysql/query');
let Booking        = Reach.model('Booking');
let BookingDetails = Reach.model('BookingDetails');
let Car            = Reach.model('Car');
let CarStatus      = Reach.model('CarStatus');
let CarLocation    = Reach.model('CarLocation');
let error          = Reach.ErrorHandler;

/**
 * @class Booking
 * @static
 */
let Bookings = module.exports = {};

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
 * Updates the booking state to pending-arrival.
 * @method setPendingArrival
 * @param  {Int}  id
 * @param  {User} user
 */
Bookings.setPendingArrival = function *(id, user) {
  let booking = yield this.getBooking(id, user);

  if (booking.state !== 'new-booking') {
    throw error.parse({
      code    : 'BOOKING_INVALID_ACTION',
      message : 'You cannot set pending arrival on a booking which is ' + booking.state.replace('-', ' ')
    }, 409);
  }

  // ### Update Booking

  booking._actor = user;
  booking.state  = 'pending-arrival';
  yield booking.update();

  // ### Time Limit
  // The booking will automaticaly cancel itself after 15 minutes

  queue.scheduler.add('booking-timer-cancel', {
    uid    : 'booking-' + booking.id,
    timer  : {
      value : 15,
      type  : 'minutes'
    },
    data : {
      user    : user,
      booking : id
    }
  });

  return booking;
};

/**
 * Updates the booking state to pending-arrival.
 * @method setCancelled
 * @param  {Int}  id
 * @param  {User} user
 */
Bookings.setCancelled = function *(id, user) {
  let booking = yield this.getBooking(id, user);
  let allowed = [ 'new-booking', 'pending-arrival' ];

  if (allowed.indexOf(booking.state) === -1) {
    throw error.parse({
      code    : 'BOOKING_INVALID_ACTION',
      message : 'You cannot cancel a booking which is ' + booking.state.replace('-', ' ')
    }, 409);
  }

  yield Booking.setCarStatus('available', booking.carId, user);

  // ### Update Booking

  booking._actor = user;
  booking.state  = 'cancelled';
  yield booking.update();

  // ### Remove Time Limit
  // Remove the auto cancel job on the booking

  queue.scheduler.cancel('booking-timer-cancel', 'booking-' + booking.id);

  return booking;
};

/**
 * Updates the booking state to in-progress.
 * @method setInProgress
 * @param  {Int}  id
 * @param  {User} user
 */
Bookings.setInProgress = function *(id, user) {
  let booking   = yield this.getBooking(id, user);
  let carCoords = yield CarLocation.find({ where : { carId : booking.carId }, limit : 1 });

  if (booking.state !== 'new-booking' && booking.state !== 'pending-arrival') {
    throw error.parse({
      code    : 'BOOKING_INVALID_ACTION',
      message : 'You cannot start a ride which is ' + booking.state.replace('-', ' ')
    }, 409);
  }

  if (!carCoords) {
    throw error.parse({
      code    : 'CAR_NO_LOCATION',
      message : 'The location of the booked car is unknown'
    }, 409);
  }

  // ### Start Ride

  let details  = new BookingDetails({
    bookingId : booking.id,
    type      : 'start',
    time      : moment().format('YYYY-MM-DD HH-mm-ss'),
    latitude  : carCoords.latitude,
    longitude : carCoords.longitude,
    odometer  : 28000,
    charge    : 78
  });

  details._actor = user;
  yield details.save();

  booking.state = 'in-progress';
  yield booking.update();

  // ### Remove Time Limit
  // Remove the auto cancel job on the booking

  queue.scheduler.cancel('booking-timer-cancel', 'booking-' + booking.id);

  return booking;
};

/**
 * Updates the booking state to pending-payment.
 * @method setPendingPayment
 * @param  {Int}  id
 * @param  {User} user
 */
Bookings.setPendingPayment = function *(id, user) {
  let booking   = yield this.getBooking(id, user);
  let carCoords = yield CarLocation.find({ where : { carId : booking.carId }, limit : 1 });

  if (booking.state !== 'in-progress') {
    throw error.parse({
      code    : 'BOOKING_INVALID_ACTION',
      message : 'You cannot end a ride which is ' + booking.state.replace('-', ' ')
    }, 409);
  }

  if (!carCoords) {
    throw error.parse({
      code    : 'CAR_NO_LOCATION',
      message : 'The location of the booked car is unknown'
    }, 409);
  }

  let details = new BookingDetails({
    bookingId : booking.id,
    type      : 'end',
    time      : moment().format('YYYY-MM-DD HH-mm-ss'),
    latitude  : carCoords.latitude,
    longitude : carCoords.longitude,
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

  booking.state = 'pending-payment';
  yield booking.update();

  // ### Car Status
  // Set the car status back to available.

  yield this.setCarStatus('available', booking.carId, user);

  return booking;
};

/**
 * Returns a list of bookings with related details.
 * @method getBookings
 * @return {Array}
 */
Bookings.getBookings = function *(query) {
  let list = yield Booking.find({
    where : q.parseWhere(query, {
      customerId : '?',
      carId      : '?',
      paymentId  : '?',
      state      : '?'
    }),
    limit  : query.limit  || 20,
    offset : query.offset || 0
  });
  if (list) {
    yield list.hasMany(BookingDetails, 'bookingId', 'details');
  }
  return list;
};

/**
 * Returns a booking based on the provided booking and user.
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
  if (count !== 0) {
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
  if (count === 0) {
    throw error.parse({
      code    : 'CAR_INVALID',
      message : 'The requested car does not exist'
    }, 409);
  }
  let state  = yield CarStatus.find({ where : { carId : id }, limit : 1 });
  if (state && state.status === 'unavailable') {
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
      carStatus         = yield CarStatus.find({ where : { carId : car }, limit : 1 });
      carStatus.diverId = null;
      carStatus.status  = status;
      carStatus._actor  = user;
      yield carStatus.update('carId');
      break;
    default:
      throw error.parse({
        code     : 'BOOKING_BAD_STATUS',
        message  : 'You must set a valid booking status',
        solution : 'Check callers of the setCarStatus method on Bookings class and make sure it is setting valid states'
      });
  }
};