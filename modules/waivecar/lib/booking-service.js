'use strict';

let Service     = require('./classes/service');
let cars        = require('./car-service');
let fees        = require('./fee-service');
let queue       = Bento.provider('queue');
let queryParser = Bento.provider('sequelize/helpers').query;
let error       = Bento.Error;
let config      = Bento.config.waivecar;

// ### Models

let File           = Bento.model('File');
let Payment        = Bento.model('Shop/Order');
let User           = Bento.model('User');
let Car            = Bento.model('Car');
let Booking        = Bento.model('Booking');
let BookingDetails = Bento.model('BookingDetails');
let BookingPayment = Bento.model('BookingPayment');

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

    car.relay('update');
    booking.relay('store', user);

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
    let bookings    = [];
    let order       = query.order   ? query.order.split(',') : null;
    let showDetails = query.details ? true : false;

    // ### Parse Query

    query = queryParser(query, {
      where : {
        userId : queryParser.NUMBER,
        carId  : queryParser.STRING,
        status : queryParser.STRING
      }
    });

    if (order) {
      query.order = [ order ];
    }

    // ### Query Bookings

    if (_user.hasAccess('admin')) {
      bookings = yield Booking.find(query);
    } else {
      query.where.userId = _user.id;
      bookings = yield Booking.find(query);
    }

    // ### Prepare Bookings
    // Prepares bookings with payment, and file details.

    if (showDetails) {
      for (let i = 0, len = bookings.length; i < len; i++) {
        bookings[i] = yield this.show(bookings[i].id, _user);
      }
    }

    return bookings;
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
    let car     = yield Car.findById(booking.carId);
    let user    = yield this.getUser(booking.userId);

    this.hasAccess(user, _user);

    // ### Prepare Booking

    booking          = booking.toJSON();
    booking.car      = yield Car.findById(booking.carId);
    booking.payments = yield Payment.find({
      where : {
        id : booking.payments.map((val) => {
          return val.paymentId;
        })
      }
    });

    booking.files = yield File.find({
      where : {
        collectionId : booking.collectionId
      }
    });

    delete booking.carId;

    return booking;
  }

  /*
   |--------------------------------------------------------------------------------
   | Update Methods
   |--------------------------------------------------------------------------------
   |
   | Updates the booking with the provided action.
   | Endpoint : PUT /bookings/:id/:action
   | Actions  : ready|start|end|complete|close
   |
   */

  /**
   * Unlocks the car and lets the driver prepeare before starting the ride.
   * @param  {Number} id    The booking ID.
   * @param  {Object} _user
   * @return {Object}
   */
  static *ready(id, _user) {
    let booking = yield this.getBooking(id);
    let user    = yield this.getUser(booking.userId);
    let car     = yield this.getCar(booking.carId);

    this.hasAccess(user, _user);

    // ### Verify Status

    if (booking.status !== 'reserved') {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You must be in 'reserved' status to start your ride, you are currently in '${ booking.getStatus() }' status.`
      }, 400);
    }

    // ### Update Status & Remove Cancel Timer

    yield booking.ready();
    yield booking.delCancelTimer();

    // ### Relay Update

    car.relay('update');
    booking.relay('update', user);

    // ### Unlock Car

    return yield cars.unlockCar(car.id, _user);
  }

  /**
   * Starts the booking and initiates the drive.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *start(id, _user) {
    let booking = yield this.getBooking(id);
    let user    = yield this.getUser(booking.userId);
    let car     = yield this.getCar(booking.carId);

    this.hasAccess(user, _user);

    // ### Verify Status

    if (booking.status !== 'ready') {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You must be in 'ready' status to start your ride, you are currently in '${ booking.getStatus() }' status.`
      }, 400);
    }

    // ### Start Booking
    // 1. Log the initial details of the booking and car details.
    // 2. Start the free ride remind timer.
    // 3. Update the booking status to 'started'.
    // 4. Return the immobilizer unlock results.

    yield this.logDetails('start', booking, car);
    yield booking.setFreeRideReminder(config.booking.timers.freeRideReminder);
    yield booking.start();

    // ### Relay Update

    car.relay('update');
    booking.relay('update', user);

    return yield cars.unlockImmobilzer(car.id, _user);
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

    this.hasAccess(user, _user);

    // ### Status Check
    // Go through end booking checklist.

    if (['ready', 'started'].indexOf(booking.status) === -1) {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You can only end a booking which has been made ready or has already started.`
      }, 400);
    }

    Object.assign(car, yield cars.getDevice(car.id, _user));

    if (car.isIgnitionOn) {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You must park, and turn off the engine before ending your booking.`
      }, 400);
    }

    // ### Immobilize
    // Immobilize the engine.

    let status = yield cars.lockImmobilzer(car.id, _user);
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

    if (booking.status === 'started') {
      yield this.logDetails('end', booking, car);
    }

    // ### Create Order
    // Create a shop cart with automated fees.

    // yield fees.create(yield this.show(booking.id, _user));

    // ### End Booking

    yield booking.delFreeRideReminder();
    yield booking.end();

    // ### Relay Update

    car.relay('update');
    booking.relay('update', user);
  }

  /**
   * Locks, and makes the car available for a new booking.
   * @return {Object}
   */
  static *complete(id, _user) {
    let booking = yield this.getBooking(id);
    let car     = yield this.getCar(booking.carId);
    let user    = yield this.getUser(booking.userId);
    let errors  = [];

    this.hasAccess(user, _user);

    if (booking.status !== 'ended') {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You cannot complete a booking which has not yet ended.`
      }, 400);
    }

    Object.assign(car, yield cars.getDevice(car.id, _user));

    // ### Validate Complete Status
    // Make sure all required car states are valid before allowing the booking to
    // be completed and released for next booking.

    if (car.isIgnitionOn) { errors.push('isIgnitionOn'); }
    if (!car.isKeySecure) { errors.push('isKeySecure'); }

    if (errors.length) {
      throw error.parse({
        code    : `BOOKING_COMPLETE_INVALID`,
        message : `Ride cannot be completed before the required steps have been performed.`,
        data    : errors
      }, 400);
    }

    yield cars.lockCar(car.id, _user);

    // ### Booking & Car Updates

    yield booking.complete();
    yield car.available();

    // ### Relay

    booking.relay('update', user);
    car.relay('update');
  }

  /**
   * Closes the ride and sends the fee cart if applicable for collection.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *close(id, _user) {
    if (!_user.hasAccess('admin')) {
      throw error.parse({
        error   : `INVALID_PRIVILEGES`,
        message : `You do not have the required privileges to perform this operation.`
      });
    }
    let booking = yield this.getBooking(id);

    // Payment stuff to be done...
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
    yield car.available();

    // ### Relay Update

    car.relay('update');
    booking.relay('update', user);
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
