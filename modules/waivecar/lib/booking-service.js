'use strict';

let request      = require('co-request');
let Service      = require('./classes/service');
let cars         = require('./car-service');
let fees         = require('./fee-service');
let notify       = require('./notification-service');
let queue        = Bento.provider('queue');
let queryParser  = Bento.provider('sequelize/helpers').query;
let relay        = Bento.Relay;
let error        = Bento.Error;
let config       = Bento.config.waivecar;
let OrderService = Bento.module('shop/lib/order-service');

// ### Models

let File           = Bento.model('File');
let Order          = Bento.model('Shop/Order');
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

    if (user.id === _user.id && _user.hasAccess('admin')) {
      // skip access check...
    } else {
      yield this.hasBookingAccess(user);
    }

    // ### Add Driver
    // Add the driver to the car so no simultaneous requests can book this car.
    if (car.userId !== null) {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `Another driver has already reserved this WaiveCar.`
      }, 400);
    }
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

    // ### Notifications

    yield notify.sendTextMessage(user, `Hi There! Your WaiveCar reservation has been confirmed. You'll have 15 minutes to get to your WaiveCar before your reservation expires. Let us know if you have any questions.`);
    yield notify.notifyAdmins(`${ _user.name() } created a booking | Car: ${ car.license || car.id } | Driver: ${ user.name() } <${ user.phone || user.email }>`, [ 'slack' ], { channel : '#reservations' });

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

    let booking = yield this.getBooking(id, relations);
    let car     = yield Car.findById(booking.carId);
    let user    = yield this.getUser(booking.userId);

    this.hasAccess(user, _user);

    // ### Prepare Booking

    booking.user     = user;
    booking.car      = yield Car.findById(booking.carId);
    booking.cart     = yield fees.get(booking.cartId, _user);
    booking.payments = yield Order.find({
      where : {
        id : booking.payments.reduce((list, next) => {
          list.push(next.orderId);
          return list;
        }, [])
      }
    });

    booking.files = yield File.find({
      where : {
        collectionId : booking.collectionId || undefined
      }
    });

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

    // Verify no one else has booked car
    if (car.userId !== user.id) {
      yield booking.cancel();
      yield booking.delCancelTimer();
      yield car.removeDriver();
      yield car.available();

      car.relay('update');
      booking.relay('update');
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `Another driver has already reserved this WaiveCar.`
      }, 400);
    }

    // ### Start Booking
    // 1. Delete the booking cancelation timer
    // 2. Log the initial details of the booking and car details.
    // 3. Start the free ride remind timer.
    // 4. Update the booking status to 'started'.
    // 5. Unlock the car and immobilizer.

    yield booking.delCancelTimer();
    yield this.logDetails('start', booking, car);

    yield booking.setReminders(user, config.booking.timers);
    yield booking.start();

    yield cars.unlockCar(car.id, _user);
    yield cars.unlockImmobilzer(car.id, _user);

    // ### Notify

    yield notify.notifyAdmins(`${ _user.name() } started a booking | Car: ${ car.license || car.id } | Driver: ${ user.name() } <${ user.phone || user.email }>`, [ 'slack' ], { channel : '#reservations' });
    yield notify.sendTextMessage(user, `Your WaiveCar rental has started! The first 2 hours are completely FREE! After that, it's $5.99 / hour. Make sure to return the car in Santa Monica, don't drain the battery under 20%, and keep within our driving borders to avoid any charges. Thanks for renting with WaiveCar!`);

    // ### Relay Update

    car.relay('update');
    yield this.relay('update', id, _user);
  }

  /**
   * Starts the booking and initiates the drive.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *start(id, _user) {
    /*
    This no longer server any purpose and was moved up to the ready method, we keeping this method in place
    so that the app doesn't hit any errors when attempting to call it.

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
    yield booking.setReminders(user, config.booking.timers);
    yield booking.start();
    yield cars.unlockImmobilzer(car.id, _user);

    // ### Notify Admins

    yield notify.notifyAdmins(`${ _user.name() } started a booking | Car: ${ car.license || car.id } | Driver: ${ user.name() } <${ user.phone || user.email }>`, [ 'slack' ]);
    yield notify.sendTextMessage(user, `Your WaiveCar rental has started! The first 2 hours are completely FREE! After that, it's $5.99 / hour. Make sure to return the car in Santa Monica, don't drain the battery under 20%, and keep within our driving borders to avoid any charges. Thanks for renting with WaiveCar!`);

    // ### Relay Update

    car.relay('update');
    yield this.relay('update', id, _user);
    */
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

    if ([ 'ready', 'started' ].indexOf(booking.status) === -1) {
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

    // ### Auto Lock
    // Sets the car connected to the booking on a 5 minute auto lock timer.

    yield booking.setAutoLock();

    // ### Reset Car
    // Remove the driver from the vehicle.

    yield car.removeDriver();

    // ### Booking Details

    yield this.logDetails('end', booking, car);

    // ### Create Order
    // Create a shop cart with automated fees.

    yield fees.create(booking, car, _user);

    // ### End Booking

    yield booking.delReminders();
    yield booking.end();

    // ### Handle auto charge for time
    yield this.handleTimeCharge(booking, user);

    // ### Notify

    yield notify.notifyAdmins(`${ _user.name() } ended a booking | Car: ${ car.license || car.id } | Driver: ${ user.name() } <${ user.phone || user.email }>`, [ 'slack' ], { channel : '#reservations' });

    // ### Relay Update

    car.relay('update');
    yield this.relay('update', id, _user);
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

    let data = yield cars.getDevice(car.id, _user);
    yield car.update(data);

    // ### Validate Complete Status
    // Make sure all required car states are valid before allowing the booking to
    // be completed and released for next booking.

    if (car.isIgnitionOn) { errors.push('turn off Ignition'); }
    if (!car.isKeySecure) { errors.push('secure Key'); }

    if (errors.length) {
      let message = `Your Ride cannot be completed until you `;
      switch (errors.length) {
        case 1: {
          message = `${ message }${ errors[0] }.`;
          break;
        }
        case 2: {
          message = `${ message }${ errors.join(' and ') }.`;
          break;
        }
        default: {
          message = `${ message }${ errors.slice(0, -1).join(', ') } and ${ errors.slice(-1) }.`;
          break;
        }
      }

      throw error.parse({
        code    : `BOOKING_COMPLETE_INVALID`,
        message : message,
        data    : errors
      }, 400);
    }

    yield cars.lockCar(car.id, _user);

    // ### Booking & Car Updates

    yield booking.complete();
    yield car.available();

    yield notify.sendTextMessage(user, `Thanks for renting with WaiveCar! Your rental is complete. You can see your trip summary in the app.`);
    yield notify.slack({
      text : `${ user.name() } completed a booking | Car: ${ car.license || car.id } | Driver: ${ user.name() } <${ user.phone || user.email }> | https://www.waivecar.com/bookings/${ booking.id }`
    }, { channel : '#reservations' });

    // ### Relay

    car.relay('update');
    yield this.relay('update', id, _user);
  }

  /**
   * Closes a booking, this method is run when no payment is needed.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Void}
   */
  static *close(id, _user) {
    let booking = yield this.getBooking(id);
    yield booking.close();
    yield this.relay('update', booking.id, _user);
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
    booking.relay('update');

    yield notify.sendTextMessage(user, `Your WaiveCar reservation has been cancelled.`);
    yield notify.slack({
      text : `${ user.name() } cancelled a booking | Car: ${ car.license || car.id } | Driver: ${ user.name() } <${ user.phone || user.email }>`
    }, { channel : '#reservations' });
  }

  /*
   |--------------------------------------------------------------------------------
   | Extras
   |--------------------------------------------------------------------------------
   |
   | A list of extra methods helpfull for when you need to get some out of the
   | ordinary work done.
   |
   */

   /**
    * Updates all details with missing address stamps.
    * @return {Void}
    */
  static *patchAddressDetails() {
    let list = yield BookingDetails.find({
      where : {
        address : null
      }
    });
    for (let i = 0, len = list.length; i < len; i++) {
      let details = list[i];
      if (!details.address) {
        yield details.update({
          address : yield this.getAddress(details.latitude, details.longitude)
        });
      }
    }
  }

  /**
   * Creates order if booking requires automatic charge for time driven
   * @param {Object} booking
   * @param {Object} user
   */
  static *handleTimeCharge(booking, user) {
    yield OrderService.createTimeOrder(booking, user);
  }

  // ### HELPERS

  static *relay(type, id, _user) {
    let payload = {
      type : type,
      data : yield this.show(id, _user)
    };
    relay.user(payload.userId, 'bookings', payload);
    relay.admin('bookings', payload);
  }

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
      address   : yield this.getAddress(car.latitude, car.longitude),
      mileage   : car.totalMileage,
      charge    : car.charge
    });
    yield details.save();
  }

  /**
   * Fetches an address from the provided lat long coordinates.
   * @param  {Number} lat
   * @param  {Number} long
   * @return {String}
   */
  static *getAddress(lat, long) {
    let res = yield request(`http://maps.googleapis.com/maps/api/geocode/json`, {
      qs : {
        latlng : `${ lat },${ long }`
      }
    });
    let body = JSON.parse(res.body);
    return body.results.length ? body.results[0].formatted_address : null;
  }

};
