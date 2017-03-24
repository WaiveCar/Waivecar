'use strict';

let request      = require('co-request');
let Service      = require('./classes/service');
let cars         = require('./car-service');
let fees         = require('./fee-service');
let notify       = require('./notification-service');
let UserService  = require('./user-service');
let CarService   = require('./car-service');
let queue        = Bento.provider('queue');
let queryParser  = Bento.provider('sequelize/helpers').query;
let relay        = Bento.Relay;
let error        = Bento.Error;
let log          = Bento.Log;
let config       = Bento.config.waivecar;
let apiConfig    = Bento.config.api;
let OrderService = Bento.module('shop/lib/order-service');
let UserLog      = require('../../log/lib/log-service');
let LogService   = require('./log-service');
let Actions      = LogService.getActions();
let moment       = require('moment');
let redis        = require('./redis-service');
let uuid         = require('uuid');
let _            = require('lodash');
let Sequelize = require('sequelize');


// ### Models

let File           = Bento.model('File');
let Order          = Bento.model('Shop/Order');
let User           = Bento.model('User');
let Car            = Bento.model('Car');
let Booking        = Bento.model('Booking');
let BookingDetails = Bento.model('BookingDetails');
let BookingPayment = Bento.model('BookingPayment');
let ParkingDetails = Bento.model('ParkingDetails');

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
   |  driver, hence the hasAccess check.
   |
   |  We have an additional try catch when saving a booking so that we can remove
   |  the driver from the assigned car in case booking for some reason fails.
   |
   |  Once a booking has successfully been saved we start an auto cancelation timer
   |  of X minutes.
   |
   */

  static *updateState(state, _user, driver) {
    yield driver.update({state: state});
    return (_user.id === driver.id) ?
      `${ _user.name() } ${ state } ` :
      `${ _user.name() } ${ state } for ${ driver.name() }`;
  }

  /**
   * Creates a new booking.
   * @param  {Object} data  Data object containing carId, and userId.
   * @param  {Object} _user User making the request.
   * @return {Object}
   */
  static *create(data, _user) {
    let driver = yield this.getUser(data.userId);
    let car  = yield this.getCar(data.carId, data.userId, true);

    this.hasAccess(driver, _user);

    // If the user doing the booking is also the driver and the
    // user is an admin we give them the car.
    if (driver.id === _user.id && _user.hasAccess('admin')) {
      // skip access check...
    } else {
      // Otherwise we check to see if the driver can drive. This
      // means that if an admin is booking a driver who is not
      // themselves, this code is still run.
      yield this.hasBookingAccess(driver);
    }

    if (!_user.hasAccess('admin')) {
      yield this.recentBooking(driver, car);
    }

    // if someone owes us more than a dollar
    // we tell them to settle their balance with us.
    if(driver.credit < -1) {
      throw error.parse({
        code    : 'BOOKING_OUTSTANDING_CREDIT',
        message : `You have an outstanding balance of <b>$${ (-driver.credit / 100).toFixed(2) }</b>. This needs to be resolved before making a booking.`
      }, 400);
    }


    if(process.env.NODE_ENV === 'production') {
      // ### Pre authorization payment
      try {
        yield OrderService.authorize(null, driver);
      } catch (err) {
        throw error.parse({
          code    : 'BOOKING_AUTHORIZATION',
          message : 'Unable to authorize payment. Please validate payment method.'
        }, 400);
      }
    }

    // ### Add Driver
    // Add the driver to the car so no simultaneous requests can book this car.
    //
    // We're trying to address https://github.com/clevertech/Waivecar/issues/435
    // This is ct's really terrible way of trying to do locks. The way below
    // is from http://redis.io/topics/distlock and probably has some edge case ...
    // but for the time being I don't care, this is better than the other thing.
    //
    let key = ['booking-lock', data.carId].join(':');
    let uniq = uuid.v4();

    // We put a 15000 ms (15second) lock on this resource ... that should be ok.
    let canProceed = yield redis.set(key, uniq, 'nx', 'px', 15000);
    let check = yield redis.get(key);

    // We re-get the car to update the value.
    car = yield this.getCar(data.carId, data.userId, true);
    if (!canProceed || check !== uniq || car.userId !== null) {

      yield notify.notifyAdmins(`Potentially stopped a double booking of ${ car.info() }.`, [ 'slack' ], { channel : '#rental-alerts' });

      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `Another driver has already reserved this WaiveCar.`
      }, 400);
    }
    yield car.addDriver(driver.id);

    //
    // We *could* do this, but it will be expiring in 15 seconds any way and there's
    // a way that the double booking could still occur here. 
    //
    // A gets db record
    // B gets db record
    // A adds driver and removes lock
    // B sees the lock isn't there and then adds driver and removes lock
    //
    // See doing this will screw things up...
    // yield redis.del(key)

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
    booking.relay('store', driver);

    // ### Notifications

    yield notify.sendTextMessage(driver, `Hi There! Your WaiveCar reservation with ${ car.license } has been confirmed. You'll have 15 minutes to get to your WaiveCar before your reservation expires. Let us know if you have any questions.`);

    let message = yield this.updateState('created', _user, driver);
    yield notify.notifyAdmins(`:musical_keyboard: ${ message } | ${ car.info() } ${ car.averageCharge() }% ${ driver.info() }`, [ 'slack' ], { channel : '#reservations' });
    yield LogService.create({ bookingId : booking.id, carId : car.id, userId : driver.id, action : Actions.CREATE_BOOKING }, _user);

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
    let dbQuery     = queryParser(query, {
      where : {
        userId : queryParser.NUMBER,
        carId  : queryParser.STRING,
        status : queryParser.IN
      }
    });

    //
    // In order to understand this you should really look at
    // https://github.com/clevertech/Waivecar/issues/667 and 
    // https://github.com/clevertech/Waivecar/issues/524
    //
    if(query.search) {
      // We first look to see if any of the cars match this.
      let carList = yield CarService.find(query.search);
      if(carList.length) {
        dbQuery.where.car_id = { $in: carList.map(ab => ab.id) };  
      }

      // Then look for users that may match
      let userList = yield UserService.find(query.search);
      if(userList.length) {
        dbQuery.where.user_id = { $in: userList.map(ab => ab.id) };  
      }
    }

    if (query.cutoff) {
      // NOTE: The string will be duck-typed to an int given 
      // the multiplication operator.
      dbQuery.where.created_at = { $lt : new Date(query.cutoff * 1000) }
    }

    dbQuery.limit = +query.limit || 20;

    if (query.order) {
      dbQuery.order = [ query.order.split(',') ];
    }

    // ### Query Bookings

    if (_user.hasAccess('admin')) {
      bookings = yield Booking.find(dbQuery);
    } else {
      dbQuery.where.user_id = _user.id;
      bookings = yield Booking.find(dbQuery);
    }

    // ### Prepare Bookings
    // Prepares bookings with payment, and file details.

    if (query.details) {
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
  static *show(id, _user, ignoreUser) {
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

    if (!ignoreUser) this.hasAccess(user, _user);

    // ### Prepare Booking

    booking.user     = user;
    booking.car      = yield Car.findById(booking.carId);
    try {
      booking.cart     = yield fees.get(booking.cartId, _user);
    } catch(ex) {
      booking.cart     = null;
    }
    booking.payments = yield Order.find({
      where : {
        id : booking.payments.reduce((list, next) => {
          list.push(next.orderId);
          return list;
        }, [])
      }
    });

    // ### Attach parking details
    if (booking.details && booking.details.length) {
      for (let i = 0, len = booking.details.length; i < len; i++) {
        let detail = booking.details[i];
        detail.parkingDetails = yield ParkingDetails.findOne({ where : { bookingDetailId : detail.id } });
      }
    }

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

    let message = yield this.updateState('started', _user, user);
    yield notify.notifyAdmins(`:octopus: ${ message } | ${ car.info() } ${ car.averageCharge() }% ${ user.info() }`, [ 'slack' ], { channel : '#reservations' });
    yield notify.sendTextMessage(user, `Your WaiveCar rental has started! The first 2 hours are completely FREE! After that, it's $5.99 / hour. Make sure to return the car in Santa Monica, don't drain the battery under 20%, and keep within our driving borders to avoid any charges. Thanks for renting with WaiveCar!`);

    // ### Relay Update

    car.relay('update');
    yield this.relay('update', booking, _user);
  }

  /**
   * Starts the booking and initiates the drive.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *start(id, _user) {
    // This no longer server any purpose and was moved up to the ready method, we keeping this method in place
    // so that the app doesn't hit any errors when attempting to call it.
  }

  /**
   * Ends the ride by calculating costs and setting the booking into pending payment state.
   * @param  {Number} id    The booking ID.
   * @param  {Object} _user
   * @return {Object}
   */
  static *end(id, _user, query, payload) {
    let booking = yield this.getBooking(id);
    let car     = yield this.getCar(booking.carId);
    let user    = yield this.getUser(booking.userId);
    let warnings = [];
    let isAdmin = _user.hasAccess('admin');

    this.hasAccess(user, _user);

    // ### Status Check
    // Go through end booking checklist.

    if ([ 'ready', 'started' ].indexOf(booking.status) === -1) {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You can only end a booking which has been made ready or has already started.`
      }, 400);
    }

    try {
      Object.assign(car, yield cars.getDevice(car.id, _user, 'booking.end'));
    } catch (err) {
      log.debug('Failed to fetch car information when ending booking');
      if (isAdmin) warnings.push('car is unreachable');
    }

    if(process.env.NODE_ENV === 'production') {
      if (car.isIgnitionOn) {
        if (isAdmin) {
          warnings.push('the ignition is on');
        } else {
          throw error.parse({
            code    : `BOOKING_REQUEST_INVALID`,
            message : `You must park, and turn off the engine before ending your booking.`
          }, 400);
        }
      }
    }

    // ### Immobilize
    // Immobilize the engine.
    let status;
    try {
      status = yield cars.lockImmobilzer(car.id, _user);
    } catch (err) {
      log.warn(`Unable to lock immobilizer when ending booking ${ booking.id }`);
    }

    if (!status || !status.isImmobilized) {
      if (isAdmin) {
        warnings.push('the engine is not immobilized');
      } else {
        throw error.parse({
          code    : `BOOKING_END_IMMOBILIZER`,
          message : `Immobilizing the engine failed.`
        }, 400);
      }
    }

    if (isAdmin && warnings.length && !query.force) {
      throw error.parse({
        code    : `BOOKING_END`,
        message : `The booking can't be ended because ${ warnings.join(' and ')}.`
      }, 400);
    }

    // Rides are attempted to be completed some time period after they are ended
    // If everything is ok then they go to complete
    yield booking.setCompleteCheck();

    // Sets the car connected to the booking on a 5 minute auto lock timer.
    yield booking.setAutoLock();

    // ### Reset Car
    // Remove the driver from the vehicle.

    yield car.removeDriver();

    // ### Booking Details

    let endDetails = yield this.logDetails('end', booking, car);

    // ### Create Order
    // Create a shop cart with automated fees.

    yield fees.create(booking, car, _user);

    // ### End Booking

    yield booking.delReminders();
    yield booking.end();

    let deltas = yield this.getDeltas(booking);

    // ### Handle auto charge for time
    if (!isAdmin) {
      yield this.handleTimeCharge(booking, user);

    } else if(deltas.duration > 120) {
      yield notify.slack({ text : `:umbrella: Booking ended by admin. Time driven was over 2 hours. ${ Bento.config.web.uri }/bookings/${ id }`
      }, { channel : '#adminended' });
    }

    // Parking restrictions:
    let parkingSlack;
    if (payload && payload.data && payload.data.type) {
      let parkingText = '';
      payload.data.bookingDetailId = endDetails.id;

      if (payload.data.type === 'street') {
        let minuteText = ((payload.data.streetMinutes || 0) + 100).toString().slice(1);
        parkingText += `Parked on street for ${ payload.data.streetHours }:${ minuteText }.  `;
        parkingText += payload.data.streetOvernightRest ? 'Has an overnight restriction.' : 'Does not have an overnight restriction.';
      } else {
        parkingText += `Parked in lot for ${ payload.data.lotHours }:${ payload.data.lotMinutes }.  `;
        parkingText += payload.data.lotFreePeriod ? `Has free period of ${ payload.data.lotFreeHours } hours.  ` : '';
        parkingText += payload.data.lotLevel ? `On level ${ payload.data.lotLevel }, spot ${ payload.data.lotSpot }.  ` : '';
        parkingText += payload.data.streetOvernightRest ? 'Has an overnight restriction.' : 'Does not have an overnight restriction.';
      }

      let message = yield this.updateState('ended', _user, user);

      parkingSlack = {
        text        : `:cherries: ${ message } | ${ car.info() } | ${ user.info() }`,
        attachments : [
          {
            fallback : `Parking Details`,
            color    : '#D00000',
            fields   : [
              {
                title : 'Parking Details',
                value : parkingText,
                short : false
              }
            ]
          }
        ]
      };

      if (payload.data.streetSignImage && payload.data.streetSignImage.id) {
        parkingSlack.attachments.push({
          fallback  : 'Parking image',
          color     : '#D00000',
          image_url : `https://s3.amazonaws.com/waivecar-prod/${ payload.data.streetSignImage.path }` // eslint-disable-line
        });
        payload.data.streetSignImage = payload.data.streetSignImage.id;
      }

      let parking = new ParkingDetails(payload.data);
      yield parking.save();
    }

    // ### Notify
    //
    // Slack Alerts: Scamming by booking without moving #468
    //
    // If a user ends a ride, and the booking is longer than 10 minutes, but they have driven 0 miles, send an alert to the "User Alerts" Channel.
    // Alert text: "{User Name} had booking with 0 miles driven for X minutes. {User phone number} {link to user profile}."
    // (People do this to 'hold' the car for a while).
    //

    if(deltas.duration > 10 && deltas.distance === 0) {
      yield UserLog.addUserEvent(user, 'SIT', booking.id, deltas.duration);
      yield notify.slack({ text : `:popcorn: ${ user.name() } drove 0 miles for ${ deltas.duration } minutes. ${ car.info() } | ${ user.info() } | ${ Bento.config.web.uri }/users/${ user.id }`
      }, { channel : '#user-alerts' });
    }
  
    let message = yield this.updateState('ended', _user, user);
    yield notify.slack(parkingSlack || { text : `:cherries: ${ message } | ${ car.info() } ${ car.averageCharge() }% ${ user.info() }`
    }, { channel : '#reservations' });
    yield LogService.create({ bookingId : booking.id, carId : car.id, userId : user.id, action : Actions.END_BOOKING }, _user);

    // ### Relay Update

    car.relay('update');
    yield this.relay('update', booking, _user);
  }

  static *complete(id, _user, query, payload) {
    try { 
      return yield this._complete(id, _user, query, payload);
    } catch(ex) {
      throw error.parse(ex, 400);
    }
  }

  /**
   * Locks, and makes the car available for a new booking.
   * @return {Object}
   */
  static *_complete(id, _user, query, payload) {
    let relations = {
      include : [
        {
          model : 'BookingDetails',
          as    : 'details'
        }
      ]
    };
    let booking = yield this.getBooking(id, relations);
    let car     = yield this.getCar(booking.carId);
    let user    = yield this.getUser(booking.userId);
    let isAdmin = _user.hasAccess('admin');
    let errors  = [];

    this.hasAccess(user, _user);

    if (booking.status !== 'ended') {
      throw {
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You cannot complete a booking which has not yet ended.`
      };
    }

    try {
      let data = yield cars.getDevice(car.id, _user, 'booking.complete');
      yield car.update(data);
    } catch (err) {
      log.warn(`Failed to update ${ car.info() } when completing booking ${ booking.id }`);
    }

    // ### Validate Complete Status
    // Make sure all required car states are valid before allowing the booking to
    // be completed and released for next booking.

    if(process.env.NODE_ENV === 'production') {
      if (car.isIgnitionOn) { errors.push('turn off Ignition'); }
      if (!car.isKeySecure) { errors.push('secure Key'); }
    }
      
    if (errors.length && !(_user.hasAccess('admin') && query.force)) {
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

      throw {
        code    : `BOOKING_COMPLETE_INVALID`,
        message : message,
        data    : errors
      };
    }

    try {
      yield cars.lockCar(car.id, _user);
    } catch (err) {
      log.warn(`Failed to lock ${ car.info() } when completing booking ${ booking.id }`);
    }

    // ### Booking & Car Updates

    yield booking.complete();

    // If car is under 25% make it unavailable after ride is done #514
    // We use the average to make this assessment.
    if (car.averageCharge() < 25.00 && !isAdmin) {
      yield cars.updateAvailabilityAnonymous(car.id, false);
      yield notify.slack({ text : `:spider: ${ car.info() } unavailable due to charge being under 25%. ${ car.chargeReport() }`
      }, { channel : '#rental-alerts' });
    } else {
      yield car.available();
    }

    // The user should be seeing cars to rent now.
    let message = yield this.updateState('completed', _user, user);
    yield notify.sendTextMessage(user, `Thanks for renting with WaiveCar! Your rental is complete. You can see your trip summary in the app.`);
    yield notify.slack({ text : `:coffee: ${ user.name() } ${ message } | ${ car.info() } | ${ apiConfig.uri }/bookings/${ booking.id }`
    }, { channel : '#reservations' });
    yield LogService.create({ bookingId : booking.id, carId : car.id, userId : user.id, action : Actions.COMPLETE_BOOKING }, _user);

    // ### Relay

    car.relay('update');
    yield this.relay('update', booking, _user);
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
    yield this.relay('update', booking, _user);
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

    // We consider a cancellation as effectively a reset
    yield user.update({state: 'completed'});
    let message = (_user.id === user.id) ?
      `${ _user.name() } cancelled ` :
      `${ _user.name() } cancelled for ${ user.name() }`;

    yield notify.sendTextMessage(user, `Your WaiveCar reservation has been cancelled.`);
    yield notify.slack({ text : `:pill: ${ message } | ${ car.info() } ${ user.info() }`
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

  static *relay(type, booking, _user) {
    let payload = {
      type : type,
      data : yield this.show(booking.id, _user)
    };
    relay.user(booking.userId, 'bookings', payload);
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
    return details;
  }

  static *getDetails(type, id) {
    return yield BookingDetails.findOne({
      where : {
        bookingId : id,
        type      : type
      }
    });
  }

  // Returns the duration in minutes and the difference between the mileage reads
  // of a particular booking.
  static *getDeltas(booking) {
    let start = yield this.getDetails('start', booking.id);
    let end = yield this.getDetails('end', booking.id);
    let ret = {duration: 0, distance: 0};

    if (start && end) {
      ret.duration = moment(end.createdAt).diff(start.createdAt, 'minutes');
      ret.distance = end.mileage - start.mileage;
    }

    return ret;
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

  /**
   * Determines if user has booked car in last 10 minutes
   * @param {Object} user
   * @param {Object} car
   * @return {Void}
   */
  static *recentBooking(user, car) {
    let booking = yield Booking.findOne({
      where : {
        userId : user.id,
        carId  : car.id
      },
      order : [
        [ 'created_at', 'DESC' ]
      ]
    });

    if (!booking) return;

    let minutesLapsed = moment().diff(booking.createdAt, 'minutes');
    let minTime = 10;

    switch (booking.status) {
      case 'cancelled':
        minTime = 15;
        break;
      case 'ended':
      case 'completed':
      case 'closed':
        minutesLapsed = moment().diff(booking.updatedAt, 'minutes');
        break;
    }

    if (minutesLapsed <= minTime) {
      throw error.parse({
        code    : 'RECENT_BOOKING',
        message : 'Sorry! You need to wait 10 minutes to rebook the same WaiveCar. Sharing is caring!'
      }, 400);
    }
    // See https://github.com/clevertech/Waivecar/issues/497
    //
    // The logic here is that we are going to try to see if this is under say, XX minutes and there
    // is another booking in between. 
    
    // We consider the minutes lapsed to be the updated metric.
    minutesLapsed = moment().diff(booking.updatedAt, 'minutes');
    
    // And give a margin of minutes
    minTime = 20;

    if(minutesLapsed < minTime) {

      // We now look for a booking in between.
      let bookingForCar = yield Booking.findOne({
        where : {
          carId  : car.id
        },
        order : [
          [ 'created_at', 'DESC' ]
        ]
      });

      // If the most recent booking is not by the user booking 
      // (but the user had booked within our margin) then we call
      // it suspicious but let thing go ahead.
      if(bookingForCar && bookingForCar.userId != user.id) {
        let holder = yield User.findById(bookingForCar.userId);

        // We tarnish both users' stellar records.
        yield UserLog.addUserEvent(user, 'HOLDING', holder.id, holder.name());
        yield UserLog.addUserEvent(holder, 'HOLDING', user.id, user.name());

        yield notify.notifyAdmins(`:dark_sunglasses: ${ holder.name() } | ${ holder.info() } may have been holding a car for ${ user.name() } | ${ user.info() }.`,
           [ 'slack' ], { channel : '#user-alerts' });
      }
    }
  }

};
