'use strict';

let moment         = require('moment');
let CarService     = require('./car-service');
let queue          = Reach.provider('queue');
let query          = Reach.provider('sequelize/helpers').query;
let Booking        = Reach.model('Booking');
let BookingDetails = Reach.model('BookingDetails');
let error          = Reach.Error;
let relay          = Reach.Relay;

/**
 * @class BookingService
 */
let BookingService = module.exports = {};

/**
 * Creates a new booking with the assigned car and customer.
 * @method create
 * @param  {String} car
 * @param  {Object} customer
 * @return {Booking}
 */
BookingService.create = function *(car, customer) {
  let booking = new Booking({
    carId      : car,
    customerId : customer.id,
    state      : 'new-booking'
  });
  booking._actor = customer;
  yield booking.save();
  relay.emit('bookings', {
    type    : 'store',
    booking : booking.toJSON()
  });
  return booking;
};

/**
 * Updates the booking state to pending-arrival.
 * @method cancel
 * @param  {Int}  id
 * @param  {User} user
 */
BookingService.cancel = function *(id, user) {
  let booking = yield this.getBooking(id, user);
  let allowed = [ 'new-booking', 'pending-arrival' ];
  let isAdmin = user.role === 'admin';
  if (!isAdmin && allowed.indexOf(booking.state) === -1) {
    throw error.parse({
      code    : 'BOOKING_INVALID_ACTION',
      message : 'You cannot cancel a booking which is ' + booking.state.replace('-', ' ')
    }, 400);
  }

  yield CarService.setStatus('available', booking.carId, user);

  // ### Update Booking

  booking._actor = user;

  if (isAdmin) {
    yield booking.delete();
  } else {
    booking.state  = 'cancelled';
    yield booking.update();
  }

  // ### Remove Time Limit
  // Remove the auto cancel job on the booking

  queue.scheduler.cancel('booking-timer-cancel', 'booking-' + booking.id);

  relay.emit('bookings', {
    type    : isAdmin ? 'delete' : 'update',
    booking : booking.toJSON()
  });

  return booking;
};

/**
 * Updates the booking state to pending-arrival.
 * @method pending
 * @param  {Int}  id
 * @param  {User} user
 */
BookingService.pending = function *(id, user) {
  let booking = yield this.getBooking(id, user);

  // TODO: payments!!!!!!!
  console.log('skipping authorization on payments');
  // if (booking.state !== 'payment-authorized') {
  //   throw error.parse({
  //     code    : 'BOOKING_INVALID_ACTION',
  //     message : 'You cannot set pending arrival on a booking which is ' + booking.state.replace('-', ' ')
  //   }, 400);
  // }

  // ### Update Booking

  booking._actor = user;
  booking.state  = 'pending-arrival';
  yield booking.update();

  // ### Time Limit
  // The booking will automaticaly cancel itself after 15 minutes

  queue.scheduler.add('booking-timer-cancel', {
    uid   : 'booking-' + booking.id,
    timer : {
      value : 15,
      type  : 'minutes'
    },
    data : {
      user    : user,
      booking : id
    }
  });

  relay.emit('bookings', {
    type    : 'update',
    booking : booking.toJSON()
  });

  return booking;
};

/**
 * Updates the booking state to in-progress.
 * @method start
 * @param  {Int}  id
 * @param  {User} user
 */
BookingService.start = function *(id, user) {
  let booking     = yield this.getBooking(id, user);
  let coords      = yield CarService.getLocation(booking.carId);
  let diagnostics = yield CarService.getDiagnostics(booking.carId);
  let charge      = diagnostics.find(d => d.type === 'evBatteryLevel');
  let odometer    = diagnostics.find(d => d.type === 'odometer');

  if (booking.state !== 'pending-arrival') {
    throw error.parse({
      code    : 'BOOKING_INVALID_ACTION',
      message : 'You cannot start a ride which is ' + booking.state.replace('-', ' ')
    }, 400);
  }

  if (!coords) {
    throw error.parse({
      code    : 'CAR_NO_LOCATION',
      message : 'The location of the booked car is unknown'
    }, 400);
  }

  // ### Start Ride

  let details  = new BookingDetails({
    bookingId : booking.id,
    type      : 'start',
    time      : new Date(),
    latitude  : coords.latitude,
    longitude : coords.longitude,
    odometer  : Math.floor(odometer.value) || 0,
    charge    : Math.ceil(charge.value) || 0
  });

  details._actor = user;
  yield details.save();

  booking.state = 'in-progress';
  yield booking.update();

  // ### Remove Time Limit
  // Remove the auto cancel job on the booking

  queue.scheduler.cancel('booking-timer-cancel', 'booking-' + booking.id);

  relay.emit('bookings', {
    type    : 'update',
    booking : booking.toJSON()
  });

  return booking;
};

/**
 * Updates the booking state to pending-payment.
 * @method end
 * @param  {Int}  id
 * @param  {User} user
 */
BookingService.end = function *(id, user) {
  let booking     = yield this.getBooking(id, user);
  let coords      = yield CarService.getLocation(booking.carId);
  let diagnostics = yield CarService.getDiagnostics(booking.carId);
  let charge      = diagnostics.find(d => d.type === 'evBatteryLevel');
  let odometer    = diagnostics.find(d => d.type === 'odometer');

  if (booking.state !== 'in-progress') {
    throw error.parse({
      code    : 'BOOKING_INVALID_ACTION',
      message : 'You cannot end a ride which is ' + booking.state.replace('-', ' ')
    }, 400);
  }

  if (!coords) {
    throw error.parse({
      code    : 'CAR_NO_LOCATION',
      message : 'The location of the booked car is unknown'
    }, 400);
  }

  let details = new BookingDetails({
    bookingId : booking.id,
    type      : 'end',
    time      : new Date(),
    latitude  : coords.latitude,
    longitude : coords.longitude,
    odometer  : Math.floor(odometer.value) || 0,
    charge    : Math.ceil(charge.value) || 0
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

  yield CarService.setStatus('available', booking.carId, user);

  relay.emit('bookings', {
    type    : 'update',
    booking : booking.toJSON()
  });

  return booking;
};

/**
 * Returns a list of bookings with related details.
 * @method getBookings
 * @param  {Object} options
 * @return {Array}
 */
BookingService.getBookings = function *(options) {
  options.limit = options.limit || 20;
  return yield Booking.find(query(options, {
    where : {
      customerId : query.NUMBER,
      carId      : query.STRING,
      paymentId  : query.NUMBER,
      state      : query.STRING
    },
    include : [{
      model : 'BookingDetails',
      as    : 'details',
      attr  : [ 'type', 'time', 'latitude', 'longitude', 'odometer', 'charge' ]
    }]
  }));
};

/**
 * Returns a booking based on the provided booking and user.
 * @method getBooking
 * @param  {String}  id
 * @param  {Object}  user
 * @return {Booking} res
 */
BookingService.getBooking = function *(id, user) {
  let where = {
    id : id
  };
  if (user.role !== 'admin') {
    where.customerId = user.id;
  }

  let booking = yield Booking.findOne({
    where   : where,
    include : [
      {
        model : 'BookingDetails',
        as    : 'details',
        attr  : [ 'type', 'time', 'latitude', 'longitude', 'odometer', 'charge' ]
      }
    ]
  });
  if (!booking) {
    throw error.parse({
      code    : 'BOOKING_INVALID_USER',
      message : 'You do not have access to the provided booking'
    }, 400);
  }
  booking._actor = user;
  return booking;
};