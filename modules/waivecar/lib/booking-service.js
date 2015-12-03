'use strict';

let Service        = require('./classes/service');
let CarService     = require('./car-service');
let queue          = Bento.provider('queue');
let queryParser    = Bento.provider('sequelize/helpers').query;
let File           = Bento.model('File');
let Payment        = Bento.model('Shop/Order');
let User           = Bento.model('User');
let Car            = Bento.model('Car');
let Booking        = Bento.model('Booking');
let BookingDetails = Bento.model('BookingDetails');
let BookingPayment = Bento.model('BookingPayment');
let error          = Bento.Error;
let relay          = Bento.Relay;
let config         = Bento.config.waivecar;

module.exports = class BookingService extends Service {

  /*
   |--------------------------------------------------------------------------------
   | Create Methods
   |--------------------------------------------------------------------------------
   |
   | create() => POST /bookings
   |
   |  Creates a new booking by adding the provided userId to the provided carId.
   |  Our system currently allows admins to create new bookings on behalf of the
   |  user, hence the hasAccess check.
   |
   |  We have an additional try catch when saving a booking so that we can remove
   |  the driver from the assigned car in case booking for some reason fails.
   |
   |  Once a booking has successfully been saved we start an auto cancelation timer
   |  of X minutes.
   |
   */

  /**
   * Creates a new booking.
   * @param  {Object} data  Data object containing carId, and userId.
   * @param  {Object} _user User making the request.
   * @return {Object}
   */
  static *create(data, _user) {
    let user = yield this.getUser(data.userId);
    let car  = yield this.getCar(data.carId, data.userId, true);

    this.hasAccess(user, _user);

    yield this.hasBookingAccess(user);

    // ### Add Driver
    // Add the driver to the car so no simultaneous requests can book this car.

    yield car.addDriver(user.id);

    // ### Create Booking
    // Attempt to create a new booking, if booking fails to save we remove the
    // driver before throwing the error.

    let booking = new Booking({
      carId  : data.carId,
      userId : data.userId
    });

    try {
      yield booking.save();
    } catch (err) {
      yield car.removeDriver(); // Remove driver if we failed to save the booking
      throw err;
    }

    yield booking.setCancelTimer(config.booking.timers.autoCancel);

    // ### Relay Booking

    let payload = {
      type : 'store',
      data : booking.toJSON()
    };

    relay.user(user.id, 'bookings', payload);
    relay.admin('bookings', payload);

    // ### Return Booking

    return booking;
  }

  /*
   |--------------------------------------------------------------------------------
   | Read Methods
   |--------------------------------------------------------------------------------
   |
   | Booking allows for standard RESTful methods of indexing an array of records
   | and viewing a single record.
   |
   | index() => GET /bookings
   |
   |  Depending on the request role we return all queries records, or all records
   |  belonging to the requesting user. Only administrators has full access to all
   |  booking records in the database.
   |
   | show() => GET /bookings/:id
   |
   |  Returns a single booking with attached payments and files. A record is only
   |  available to the user if they are the owner of the record or if the requesting
   |  user is an administrator.
   |
   */

  /**
   * Returns a list of bookings.
   * @param  {Object} query
   * @param  {Object} _user
   * @return {Array}
   */
  static *index(query, _user) {
    query = queryParser(query, {
      where : {
        userId : queryParser.NUMBER,
        carId  : queryParser.STRING,
        status : queryParser.STRING
      }
    });

    // ### Admin Query

    if (_user.isAdmin()) {
      return yield Booking.find(query);
    }

    // ### User Query

    query.where.userId = _user.id;
    return yield Booking.find(query);
  }

  /**
   * Returns a booking based on provided id.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *show(id, _user) {
    let relations = {
      include : [
        {
          model : 'BookingDetails',
          as    : 'details'
        },
        {
          model      : 'BookingPayment',
          as         : 'payments',
          attributes : [ 'orderId' ]
        }
      ]
    };

    // ### Get Booking

    let booking = yield Booking.findById(id, relations);
    let user    = yield this.getUser(booking.userId);

    this.hasAccess(user, _user);

    // ### Prepare Booking

    booking = booking.toJSON();

    // ### Append Payments

    booking.payments = yield Payment.find({
      where : {
        id : booking.payments.map((val) => {
          return val.paymentId;
        })
      }
    });

    // ### Append Files

    booking.files = yield File.find({
      where : {
        collectionId : booking.collectionId
      }
    });

    return booking;
  }

  /*
   |--------------------------------------------------------------------------------
   | Update Methods
   |--------------------------------------------------------------------------------
   |
   | Service update methods are used for triggering status updates on the booking
   | via a collection of PUT endpoints.
   |
   | start() => PUT /bookings/:id/start
   |
   |  The user has arrived at the car and confirms that they want to start the
   |  booking. At this point we unlock the car, and update the status of the
   |  booking. From this point cancellation is no longer possible, and any
   |  automatic cancelation timers are removed.
   |
   | ready() => PUT /bookings/:id/ready
   |
   |  The user has removed the key from the fob and is ready to start their drive.
   |  We send a request to check if the key is out before unlocking the immobilizer
   |  allowing the user to start the engine.
   |
   | end() => PUT /bookings/:id/end
   |
   |  The ride has ended, flow to be finalized...
   |
   */

  /**
   * Starts the booking and initiates the drive.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *start(id, _user) {
    let booking   = yield this.getBooking(id);
    let car       = yield this.getCar(booking.carId);
    let user      = yield this.getUser(booking.userId);
    let checkList = [ 'cancelled', 'started', 'ended', 'completed' ];

    this.hasAccess(user, _user);

    // ### Check Status
    // A booking can only be started once certain criterias are met, we need to ensure that
    // the status is correct in corelation with the booking.

    if (checkList.indexOf(booking.status) !== -1) {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You cannot start a ride for a booking that is ${ booking.getStatus() }`
      }, 400);
    }

    // ### Booking Details

    yield this.logDetails('start', booking, car);

    // ### Update Booking Status

    yield booking.start();
    yield booking.delCancelTimer();

    // ### Unlock Car

    return yield CarService.unlockCar(car.id, _user);
  }

  /**
   * Unlocks the engine and starts ride timers.
   * @param  {Number} id    The booking ID.
   * @param  {Object} _user
   * @return {Object}
   */
  static *ready(id, _user) {
    let booking   = yield this.getBooking(id);
    let car       = yield this.getCar(booking.carId);

    // ### Check Status
    // Only booking that is in started status and which car is not immobilized
    // will go through the ride reminder and immobilizier unlock process.

    if (booking.status !== 'started') {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You cannot ready a booking which is already ${ booking.getStatus() }`
      }, 400);
    }

    if (booking.status === 'started' && !car.isImmobilized) {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `Your ride is ready, start the engine.`
      }, 400);
    }

    yield booking.setFreeRideReminder(config.booking.timers.freeRideReminder);

    return yield CarService.unlockImmobilzer(car.id, _user);
  }

  /**
   * Ends the ride by calculating costs and setting the booking into pending payment state.
   * @param  {Number} id    The booking ID.
   * @param  {Object} _user
   * @return {Object}
   */
  static *end(id, _user) {
    let booking = yield this.getBooking(id);
    let car     = yield this.getCar(booking.carId);
    let user    = yield this.getUser(booking.userId);
    let errors  = [];

    Object.assign(car, yield CarService.getDevice(car.id, _user));

    // ### Status Check
    // Go through end booking checklist.

    if (booking.status !== 'started') {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You can only end a booking that has already started.`
      }, 400);
    }

    if (car.ignition === 'on') { errors.push('ignition'); }
    if (car.keyfob === 'out')  { errors.push('keyfob'); }

    if (errors.length) {
      throw error.parse({
        code    : `BOOKING_MISSING_END_STEPS`,
        message : `Missing required steps to end a ride.`,
        data    : errors
      }, 400);
    }

    // ### Immobilize
    // Immobilize the engine.

    let status = yield CarService.lockImmobilzer(car.id, _user);
    if (!status.isImmobilized) {
      throw error.parse({
        code    : `BOOKING_END_IMMOBILIZER`,
        message : `Immobilizing the engine failed.`
      }, 400);
    }

    // ### Reset Car
    // Remove the driver from the vehicle.

    yield car.removeDriver();

    // ### Booking Details

    yield this.logDetails('end', booking, car);

    // ### End Booking

    yield booking.delFreeRideReminder();
    yield booking.end();
  }

  /*
   |--------------------------------------------------------------------------------
   | Delete Methods
   |--------------------------------------------------------------------------------
   |
   | Service currently supports booking cancelation via RESTful delete endpoint.
   |
   | DEL /bookings/:id
   |
   |  Cancels a booking by updating the booking status, removing any automatic
   |  cancelation timers and removes the driver from the booked car so that it
   |  becomes available for future booking requests.
   |
   */

  /**
   * Attempts to cancel a booking.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *cancel(id, _user) {
    let booking = yield this.getBooking(id);
    let car     = yield this.getCar(booking.carId);
    let user    = yield this.getUser(booking.userId);
    let states  = [ 'reserved', 'pending' ];

    this.hasAccess(user, _user);

    // ### Verify Status

    if (states.indexOf(booking.status) === -1) {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You cannot cancel a booking that is ${ booking.getStatus() }.`
      }, 400);
    }

    // ### Cancel Booking

    yield booking.cancel();
    yield booking.delCancelTimer();
    yield car.removeDriver();
  }

  // ### HELPERS

  /**
   * Logs the ride details.
   * @param  {String} type    The detail type, start|end.
   * @param  {Object} booking
   * @param  {Object} car
   * @return {Void}
   */
  static *logDetails(type, booking, car) {
    let details = new BookingDetails({
      bookingId : booking.id,
      type      : type,
      time      : new Date(),
      latitude  : car.latitude,
      longitude : car.longitude,
      odometer  : 0,
      charge    : 0
    });
    yield details.save();
  }

};
