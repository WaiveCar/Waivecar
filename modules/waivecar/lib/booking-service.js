'use strict';

let Service        = require('./classes/service');
let Payment        = require('./classes/payment');
let queue          = Reach.provider('queue');
let queryParser    = Reach.provider('sequelize/helpers').query;
let User           = Reach.model('User');
let Car            = Reach.model('Car');
let Booking        = Reach.model('Booking');
let BookingDetails = Reach.model('BookingDetails');
let BookingPayment = Reach.model('BookingPayment');
let error          = Reach.Error;
let relay          = Reach.Relay;
let config         = Reach.config.waivecar;

module.exports = class BookingService extends Service {

  /**
   * Creates a new booking.
   * @return {Object}
   */
  static *create(data, _user) {
    let user = yield this.getUser(data.userId);
    let car  = yield this.getCar(data.carId, data.userId, true);

    // ### Access Check
    // Check if the user can create a new booking, and verify that the
    // car requested is available.

    this.hasAccess(user, _user);

    // ### Create Booking

    let booking = new Booking({
      carId  : data.carId,
      userId : data.userId
    });
    yield booking.save();

    // ### Update Car
    // Updates the car by setting it as unavailable and assigning the user.

    yield car.update({
      userId    : data.userId,
      available : false
    });

    // ### Auto Cancel
    // Set the booking to automatically cancel after x minutes of booking
    // inactivity to free up the car other users.

    queue.scheduler.add('booking-auto-cancel', {
      uid   : `booking-${ booking.id }`,
      timer : config.booking.timer,
      data  : {
        bookingId : booking.id
      }
    });

    // ### Relay Booking
    // Submit the booking to administrative users.

    let payload = {
      type : 'store',
      data : booking.toJSON()
    };

    relay.user(user.id, 'bookings', payload)
    relay.admin('bookings', payload);

    // Prepare Booking

    return booking;
  }

  /**
   * Returns a list of bookings.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  static *index(query, role, _user) {
    if (role.isAdmin()) {
      return yield Booking.find(queryParser(query, {
        where : {
          userId : queryParser.NUMBER,
          carId  : queryParser.STRING,
          status : queryParser.STRING
        }
      }));
    }
    return yield Booking.find({
      where : {
        userId : _user.id
      }
    });
  }

  /**
   * Returns a booking based on provided id.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *show(id, _user) {
    let booking = yield Booking.findById(id, {
      include : [{
        model : 'BookingDetails',
        as    : 'details'
      }]
    });
    let user = yield this.getUser(booking.userId);

    // ### Access Check
    // Check if the user can create a new booking, and verify that the
    // car requested is available.

    this.hasAccess(user, _user);

    return booking;
  }

  /**
   * Starts the booking and initiates the drive.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *start(id, _user) {
    let booking   = yield Booking.findById(id);
    let car       = yield this.getCar(booking.carId);
    let user      = yield this.getUser(booking.userId);
    let checkList = [ 'in-progress', 'pending-payment', 'cancelled', 'completed' ];

    // ### Access Check
    // Check if the user can create a new booking, and verify that the
    // car requested is available.

    this.hasAccess(user, _user);

    // ### Check Status
    // A booking can only be started once certain criterias are met, we need to ensure that
    // the status is correct in corelation with the booking.

    if (checkList.indexOf(booking.status) !== -1) {
      throw error.parse({
        code    : `INVALID_REQUEST`,
        message : `You cannot start a ride for a booking that is ${ booking.status.replace('-', ' ') }`
      }, 400);
    }

    if (booking.status !== 'payment-authorized') {
      throw error.parse({
        code    : `MISSING_PAYMENT_AUTHORIZATION`,
        message : `The booking must be authorized for payment before we can start the ride.`
      }, 400);
    }

    // -----------------------------------------------
    // TODO: UNLOCK THE CAR BEFORE INITIATING THE RIDE
    // -----------------------------------------------

    // ### Create Details
    // Creates a detail record of the start of the ride.

    let details = new BookingDetails({
      bookingId : booking.id,
      type      : 'start',
      time      : new Date(),
      latitude  : car.latitude,
      longitude : car.longitude,
      odometer  : 0,
      charge    : 0
    });
    yield details.save();

    // ### Update Booking Status

    yield booking.update({ status : 'in-progress' });

    // ### Remove Auto Cancel

    queue.scheduler.cancel('booking-auto-cancel', `booking-${ booking.id }`);

    // -----------------------
    // TODO: START RIDE TIMERS
    // -----------------------
  }

  /**
   * Ends the ride by calculating costs and setting the booking into pending payment state.
   * @param  {Number} id    The booking ID.
   * @param  {Object} _user
   * @return {Object}
   */
  static *end(id, paymentId, _user) {
    let booking        = yield Booking.findById(id);
    let bookingPayment = yield BookingPayment.findById(paymentId);
    let car            = yield this.getCar(booking.carId);
    let user           = yield this.getUser(booking.userId);

    // ### Verify Payment

    if (!bookingPayment) {
      throw error.parse({
        code    : `INVALID_PAYMENT`,
        message : `The provided paymentId is invalid`
      }, 400);
    }

    // ### Status Check
    // Only bookings which are in a progress state can be ended through this endpoint.

    if (booking.status !== 'in-progress') {
      throw error.parse({
        code    : `INVALID_REQUEST`,
        message : `You can only end a booking that is in-progress.`
      }, 400);
    }

    // ### Create Payment

    let payment = new Payment(booking, bookingPayment);

    // -----------------------------------------------------------------------------
    // TODO: CALCULATE RIDE COST
    //       - Create a new payment (done)
    //       - Add payment items for each charge that occured during the ride.
    //         - Need a list of possible charges that can occur.
    // -----------------------------------------------------------------------------

    yield booking.update({ status : 'pending-payment' });

    return payment;
  }

}