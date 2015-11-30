'use strict';

let Service        = require('./classes/service');
let PaymentHandler = require('./classes/payment');
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
      yield car.removeDriver();
      throw err;
    }

    yield booking.setCancelTimer(config.booking.timer);

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
      include : [
        {
          model : 'BookingDetails',
          as    : 'details'
        },
        {
          model      : 'BookingPayment',
          as         : 'payments',
          attributes : [ 'paymentId' ]
        }
      ]
    });
    let user = yield this.getUser(booking.userId);

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
    let checkList = [ 'in-progress', 'pending-payment', 'cancelled', 'completed' ];

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

    /* DEPRECATED? No longer need to pre-authorize payments (only need to validate that card is active)
    if (booking.status !== 'payment-authorized') {
      throw error.parse({
        code    : `MISSING_PAYMENT_AUTHORIZATION`,
        message : `The booking must be authorized for payment before we can start the ride.`
      }, 400);
    }
    */

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

    yield booking.inProgress();
    yield booking.delCancelTimer();
  }

  /**
   * Ends the ride by calculating costs and setting the booking into pending payment state.
   * @param  {Number} id    The booking ID.
   * @param  {Object} _user
   * @return {Object}
   */
  static *end(id, paymentId, _user) {
    let booking        = yield this.getBooking(id);
    let bookingPayment = yield BookingPayment.findById(paymentId);
    let car            = yield this.getCar(booking.carId);
    let user           = yield this.getUser(booking.userId);

    // ### Verify Payment

    if (!bookingPayment) {
      throw error.parse({
        code    : `BOOKING_PAYMENT_INVALID`,
        message : `The provided payment identifier is invalid`
      }, 400);
    }

    // ### Status Check
    // Only bookings which are in a progress state can be ended through this endpoint.

    if (booking.status !== 'in-progress') {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You can only end a booking that is in-progress.`
      }, 400);
    }

    // ### Payment

    let payment = new PaymentHandler(booking, bookingPayment);

    // -----------------------------------------------------------------------------
    // TODO: CALCULATE RIDE COST
    //       - Create a new payment (done)
    //       - Add payment items for each charge that occured during the ride.
    //         - Need a list of possible charges that can occur.
    // -----------------------------------------------------------------------------

    yield booking.update({ status : 'pending-payment' });

    // ### Reset Car
    // Remove the user from the car and make it available

    yield car.delDriver();
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
   * @param  {Number} bookingId
   * @param  {Object} _user
   * @return {Object}
   */
  static *cancel(bookingId, _user) {
    let booking = yield this.getBooking(id);
    let car     = yield this.getCar(booking.carId);
    let user    = yield this.getUser(booking.userId);
    let states  = [ 'new-booking', 'payment-authorized', 'pending-arrival' ];

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

};
