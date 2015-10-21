'use strict';

let queue          = Reach.provider('queue');
let queryParser    = Reach.provider('sequelize/helpers').query;
let User           = Reach.model('User');
let Car            = Reach.model('Car');
let Booking        = Reach.model('Booking');
let BookingDetails = Reach.model('BookingDetails');
let error          = Reach.Error;
let relay          = Reach.Relay;
let config         = Reach.config.waivecar;

class BookingService {

  /**
   * Creates a new booking.
   * @return {Object}
   */
  *create(data, _user) {
    let user = yield this.getUser(data.user);
    let car  = yield this.getCar(data.car, data.user, true);

    // ### Access Check
    // Check if the user can create a new booking, and verify that the
    // car requested is available.

    this.hasAccess(user, _user);

    // ### Create Booking

    let booking = new Booking({
      carId  : data.car,
      userId : data.user
    });
    yield booking.save();

    // ### Update Car
    // Updates the car by setting it as unavailable and assigning the user.

    yield car.update({
      userId    : data.user,
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
  *index(query, role, _user) {
    if (role === 'admin') {
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
  *show(id, _user) {
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
  *start(id, _user) {
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

    // ------------------------------------------------
    // TODO: UNLOCK THE CAR BEFORE INITIATING THE RIDE!
    // ------------------------------------------------

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
  *end(id, _user) {
    /*
      TODO:
        - Create ending booking details.
        - Calculate cost of ride if any.
        - Set the booking to pending-payment status.
        - Return the booking-payment object with each item charged.
     */
  }

  // ### HELPER METHODS

  /**
   * Attempts to return the car.
   * @param  {String}  carId     The car id to retrieve.
   * @param  {Number}  userId    The user being assigned to the car if isBooking.
   * @param  {Boolean} isBooking We have special cases when isBooking is true.
   * @return {Object}
   */
  *getCar(carId, userId, isBooking) {
    let car = yield Car.findById(carId);

    if (!car) {
      throw error.parse({
        code    : `CAR_NOT_FOUND`,
        message : `The requested car does not exist.`
      }, 400);
    }

    // ### Booking
    // If we are booking we need to make sure that the car is available, and that
    // the user is eligible to retrieve a car for booking.

    if (isBooking) {
      let hasCar = yield Car.findOne({ where : { userId : userId } });
      if (hasCar) {
        throw error.parse({
          code    : `CAR_IN_PROGRESS`,
          message : `The user is already assigned to another car.`,
          data    : hasCar
        }, 400);
      }
    }

    if (isBooking && !car.available) {
      if (parseInt(car.userId) === parseInt(userId)) {
        throw error.parse({
          code    : `CAR_UNAVAILBLE`,
          message : `The user is already assigned to this car.`
        }, 400);
      } else {
        throw error.parse({
          code    : `CAR_UNAVAILBLE`,
          message : `The requested car is currently not available.`
        }, 400);
      }
    }

    return car;
  }

  /**
   * Attempts to return the user with the provided id or throws an error.
   * @param  {Number} id
   * @return {Object}
   */
  *getUser(id) {
    let user = yield User.findById(id);
    if (!user) {
      throw error.parse({
        code    : `INVALID_USER`,
        message : `The user was not found in our records.`
      }, 400);
    }
    return user;
  }

  /**
   * Only allow access if the requesting user is the actor or is administrator.
   * @param  {Object}  user  The user to be modified.
   * @param  {Object}  _user The user requesting modification.
   * @return {Boolean}
   */
  hasAccess(user, _user) {
    if (user.id !== _user.id && _user.role !== 'admin') {
      throw error.parse({
        error   : `INVALID_PRIVILEGES`,
        message : `You do not have the required privileges to perform this operation.`
      }, 400);
    }
  }

}

module.exports = new BookingService();