'use strict';

let request      = require('co-request');
let Service      = require('./classes/service');
let cars         = require('./car-service');
let fees         = require('./fee-service');
let geocode      = require('./geocoding-service');
let notify       = require('./notification-service');
let UserService  = require('../../user/lib/user-service.js');
let CarService   = require('./car-service');
let ParkingService = require('./parking-service');
let Email        = Bento.provider('email');
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
let Tikd         = require('./tikd-service');
let Actions      = LogService.getActions();
let moment       = require('moment');
let redis        = require('./redis-service');
let uuid         = require('uuid');
let _            = require('lodash');
let geolib    = require('geolib');
let sequelize = Bento.provider('sequelize');
let fs        = require('fs');
let emailConfig = Bento.config.email;


// ### Models
let File           = Bento.model('File');
let Order          = Bento.model('Shop/Order');
let User           = Bento.model('User');
let Car            = Bento.model('Car');
let Booking        = Bento.model('Booking');
let BookingDetails = Bento.model('BookingDetails');
let BookingPayment = Bento.model('BookingPayment');
let ParkingDetails = Bento.model('ParkingDetails');
let BookingLocation = Bento.model('BookingLocation');
let WaiveworkPayment = Bento.model('WaiveworkPayment');
let Location       = Bento.model('Location');
let UserParking    = Bento.model('UserParking');
let locationCache = false;

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
    relay.user(driver.id, 'User', {type: 'update', data: driver.toJSON()});
    return (_user.id === driver.id) ?
      `${ _user.link() } ${ state }` :
      `${ _user.name() } ${ state } for ${ driver.link() }`;
  }

  // Creates a new booking.
  static *create(data, _user) {
    let start = new Date();
    function t(b) {
      console.log(new Date() - start, b);
    }
    let lockKeys = yield redis.shouldProcess('booking-car', data.carId, 60 * 1000);
    if (!lockKeys) {
      throw error.parse({
        code    : 'BOOKING_AUTHORIZATION',
        message : 'Unable to start booking. Someone else is booking.'
      }, 400);
    }

    let timerMap = config.booking.timers;
    let isRush = data.opts && data.opts.rush;
    let driver = yield this.getUser(data.userId, true);
    t("begin");

    var car;
    try {
      // this will throw an error if the car is not currently available.
      car = yield this.getCar(data.carId, data.userId, true);
    } catch(err) {
      yield redis.doneWithIt(lockKeys);
      throw err;
    } 
    let isLevel = yield car.isTagged('level');
    t("get car");

    if(isRush) {
      var hour = moment().tz('America/Los_Angeles').format('H');
    }

    this.hasAccess(driver, _user);

    // If the user doing the booking is also the driver and the
    // user is an admin we give them the car.
    if (driver.hasAccess('admin') || (driver.id === _user.id && _user.hasAccess('admin'))) {
      // skip access check...
    } else {
      // Otherwise we check to see if the driver can drive. This
      // means that if an admin is booking a driver who is not
      // themselves, this code is still run.
      yield this.hasBookingAccess(driver);
    }
    t("has access");

    // If someone owes us more than a dollar
    // we tell them to settle their balance with us.
    if(driver.credit < -100) {
      yield redis.doneWithIt(lockKeys);
      throw error.parse({
        code    : 'BOOKING_OUTSTANDING_CREDIT',
        message : `You have an outstanding balance of <b>$${ (-driver.credit / 100).toFixed(2) }</b>. This needs to be resolved before making a booking.`
      }, 400);
    }

    //
    // After we achieve the lock on the car, then we can do the various things
    // with credit cards and charges.
    //
    // Importantly, we do this BEFORE CREATING A BOOKING.
    //
    // Why? Otherwise we could do, for instance, a $1 hold, then 
    // run into a race condition and never release the hold 
    //
    // The above code guarantees that we can book a car, it doesn't
    // necessarily give it to us.
    //
    let order;
    if(process.env.NODE_ENV === 'production') {
      try {
        if(driver.hasAccess('admin') || _user.isWaivework) {
          // we need to make sure that admins will pass the code below
          order = {amount: 0, createdAt: new Date()};
        } else {
          let opts = {bypass: data.bypass};
          order = yield OrderService.authorize(opts, driver);
        } 
        t("auth");
        let orderDate = moment(order.createdAt).format('MMMM Do YYYY');
        let amount = (order.amount / 100).toFixed(2);
        let title;
        let body;
        if (order.amount > 0) {
          title = `A $${amount} hold has been placed on your account during your ride on ${orderDate}` 
          body = amount === '20.00' ? 'A $20 hold has been placed on your account for your ride with Waive. This hold will be placed on your account every 2 days that you use our service. The amount of the hold can be reduced by adding a $20 credit to your account at our website.' : `A $${amount} hold has been placed on your account for your ride with Waive. This hold will be placed on your account every 2 days that you use our service.`

          let email = new Email();
          try {
            yield email.send({
              to       : driver.email,
              from     : emailConfig.sender,
              subject  : title,
              template : 'authorization',
              context  : {
                name       : driver.name(),
                amount     : amount,
                date       : orderDate,
                body,
              }
            });
            t("email");
          } catch(err) {
            log.warn('email error: ', err);
          } 
        }
      } catch (err) {
        console.log(err);
        // Failing to secure the authorization hold should be recorded as an
        // iniquity. See https://github.com/WaiveCar/Waivecar/issues/861 for
        // details.
        let details = 'no card';
        if(OrderService.authorize.last) {
          if(!OrderService.authorize.last.card) {
            yield redis.doneWithIt(lockKeys);
            throw error.parse({
              code    : 'BOOKING_AUTHORIZATION',
              message : 'We do not have a credit card for you on file. Please go to the account and add one before booking'
            }, 400);
          }
          details = OrderService.authorize.last.card.last4;
        }
        yield UserLog.addUserEvent(driver, 'AUTH', details, `Failed to authorize $${ (OrderService.authorize.last.amount / 100).toFixed(2) }`);

        yield redis.doneWithIt(lockKeys);
        throw error.parse({
          code    : 'BOOKING_AUTHORIZATION',
          message : 'Unable to authorize payment. Please validate payment method.'
        }, 400);
      }
    }

    if(!_user.hasAccess('admin') && !_user.isWaivework) {
      yield this.offerWaiveRush(driver, car, data.opts, lockKeys);
      t("rush-check");
    }
    yield this.lookForHolding(driver, car);
    t("holding-check");

    let rebookOrder;
    // If the creator isn't an admin or is booking for themselves
    if (!(isRush || driver.isWaivework || _user.hasAccess('admin'))) {// || _user.id !== driver.id) {
      rebookOrder = yield this.rebookCheck(driver, car, data.opts, lockKeys);
    }
    t("rebook-check");

    if(!driver.isWaivework) {
      let hoardRes = yield this.lookForHoarding(driver, car);
      if(hoardRes[0] >= 0.5) {
        yield UserLog.addUserEvent(driver, 'HOARD', hoardRes[0].toFixed(3) );
        yield notify.slack({ text : `:pig2: The rapacious ${ driver.link() } did ${ hoardRes[1] } of the last ${ hoardRes[2] } bookings with ${ car.license }. How rude!` }, { channel : '#rental-alerts' });
      }
    }
    t("hoard-check");

    // see #1318 we do this, as of this comment's writing, a second time, after 
    // a potential charge has gone through because stripe has some issues
    if(new Date() - start > 2000) {
      car = yield this.getCar(data.carId, data.userId);
      if (car.userId !== null && car.bookingId !== null) {

        yield notify.slack(`Phew, at the last second, we stopped a double booking ${ car.info() } by ${ driver.link() }.`, [ 'slack' ], { channel : '#rental-alerts' });

        if(rebookOrder) {
          yield OrderService.refund(null, rebookOrder.id, driver);
        }

        yield redis.doneWithIt(lockKeys);
        throw error.parse({
          code    : `BOOKING_REQUEST_INVALID`,
          message : `Another driver has already reserved this WaiveCar.`
        }, 400);
      }
    }

    let booking = new Booking({
      carId  : data.carId,
      userId : data.userId
    });
    t("booking-create");

    try {
      yield booking.save();
    } catch (err) {
      throw err;
    }

    if(isRush) {
      yield booking.addFlag('rush');
    }

    try { 
      if (rebookOrder) {
        // This booking payment is shown here so that it shows up in the itemization for the correct booking.
        let rebookPayment = new BookingPayment({
          bookingId: booking.id,
          orderId: rebookOrder.id, 
        });
        yield booking.addFlag('rebook');
        yield rebookPayment.save();
      }
    } catch (e) {
      log.warn('error saving rebook payment: ', e);
    }

    // If there is a new authorization, a new BookingPayment must be created so that it can be itemized on the receipt.
    if (process.env.NODE_ENV === 'production' && !driver.hasAccess('admin') && OrderService.authorize.last.newAuthorization) {
      try {
        let authorizationPayment = new BookingPayment({
          bookingId : booking.id,
          orderId   : order.id,
        });
        yield authorizationPayment.save();
      } catch(err) {
        log.warn(err);
      }
    };

    yield car.addDriver(driver.id, booking.id);

    // Users over 55 should always get 25 minutes to get to the car #1230
    let aidExtend = yield driver.hasTag('aid');
    if (!aidExtend) {
      let age = yield driver.age();
      aidExtend = age >= 55;
    }
    let autoExtend = yield driver.hasTag('extend');

    // The longest time period is 30 minutes, this is 
    // the best case
    if(isLevel) {
      timerMap = config.booking.timers.level;

      // Otherwise if they are old and decrepit they
      // can hobble over to the car with 25 free minutes
    } else if (aidExtend) {
      timerMap = config.booking.timers.aid;
    }

    // careful careful... we first set the cancel timer, always.
    yield booking.setCancelTimer(timerMap);

    // if the user is autoextended then we do an infinite extension
    // without sending an extra message
    if(autoExtend && !isRush) {
      try {
        yield this.extend(booking.id, {howmuch: -1, silent: true}, driver);
        yield notify.notifyAdmins(`:tulip: ${ driver.link() } autoextended their reservation with ${ car.info() }`, [ 'slack' ], { channel : '#reservations' });
      } catch(ex) { }
    }

    let timeToCar = timerMap.autoCancel.value;

    yield booking.update({
      reservationEnd: moment(booking.createdAt).add(timeToCar, 'minutes')
    });

    // If the car is currently WaiveParked, the notes from the spot need to be attached to the message.
    let currentParking = yield UserParking.findOne({ where: { carId: car.id } });

    let carpoolWarning = '';

    if(!isLevel) {
      let actionService = require('./action-service');
      let shouldWarn = yield actionService.getAction('tagWarnStartRide', driver.id, driver);
      console.log(shouldWarn);
      if(shouldWarn.action) {
        yield actionService.goForward('tagWarnLockCar', driver.id);
        carpoolWarning = ' Notice: As of January 1, 2019, WaiveCars no longer have special carpool lane privileges.';
      }
    }

    let timeToCarStr = '';
    if(isRush) {
      timeToCarStr = "You've been WaiveRushed so take your time, your reservation does not expire. Hourly charges begin at 10AM.";
    } else if(autoExtend) {
      timeToCarStr = "You've opted for automatic reservation extensions.";
    } else {
      timeToCarStr = [
        aidExtend ? 'With WaiveAid, you have' : 'You have',
        `${timeToCar} minutes to get to it`
      ].join(' ');
    }

    let msg = [
      `${car.license}'s yours!${carpoolWarning}`,
      'If you have trouble, reply "start ride" when next to the WaiveCar.', 
      (currentParking ? `It is WaiveParked with the notes: "${currentParking.notes}". ` : ''),
      timeToCarStr,
      'Thanks!'
    ].join(' ');

    if (isLevel) {
      // https://lb.waivecar.com/users/14827
      yield notify.sendTextMessage(14827, `${ driver.name() } reserved ${ car.license }.`);
      yield booking.addFlag('level');
    }

    car.relay('update');
    booking.relay('store', driver);

    yield notify.sendTextMessage(driver, msg);

    let message = yield this.updateState('created', _user, driver);
    if(isRush) {
      yield notify.notifyAdmins(`:dash: Rush ${ message } ${ car.info() } ${ car.averageCharge() }%`, [ 'slack' ], { channel : '#reservations' });
      yield this.ready(booking.id, _user);
    } else {
      yield notify.notifyAdmins(`:musical_keyboard: ${ message } ${ car.info() } ${ car.averageCharge() }%`, [ 'slack' ], { channel : '#reservations' });
    }
    yield LogService.create({ bookingId : booking.id, carId : car.id, userId : driver.id, action : Actions.CREATE_BOOKING }, _user);

    yield redis.doneWithIt(lockKeys);

    if (data.isWaivework) {
      yield this.handleWaivework(booking, data, _user, driver);
      yield booking.addFlag('Waivework');
    }
    return booking;
  }

  static *handleWaivework(booking, data, _user, driver) {
    // This function is for starting automatic billing for WaiveWork bookings. Currently, booking will occur on the 1st,
    // 8th, 15th and 22nd of each month. When the booking is started on a day that is not one of those days, they will 
    // be charged a prorated amount for the amount of time before that date
    yield this.ready(booking.id, _user);
    let today = moment()
    let currentDay = today.date();
    let nextDate;
    switch(true) {
      case currentDay === 1:
        nextDate = 1;
        break;
      case currentDay <= 8:
        nextDate = 8;
        break;
      case currentDay <= 15:
        nextDate = 15;
        break;
      case currentDay <= 22:
        nextDate = 22;
        break;
      default: 
        nextDate = 1;
        break;
    }
    let prorating = (nextDate - currentDay) / 7;
    let proratedChargeAmount = Math.floor(Number(data.amount) * (prorating > 0 ? prorating : 1)); 
    if (prorating === 0) {
      nextDate += 7;
    }
    // Here, we will need to charge the user the correct amount, create a BookingPayment and create a 
    // WaiveworkPayment for auto payement. QuickCharge should be used for the charge.
    data.source = 'WaiveWork Intial Payment';
    data.description = 'Initial Payment For WaiveWork';
    data.waivework = true;
    let weeklyAmount = data.amount;
    data.amount = proratedChargeAmount;
    // The line below should be removed later once we are done watching to see if the payment process works reliably
    // Currently, the user will just be charged $0. And is just overwriting the actual amount to be charged.
    data.amount = 0;
    let workCharge = (yield OrderService.quickCharge(data, _user)).order;
    let bookingPayment = new BookingPayment({
      bookingId: booking.id,
      orderId: workCharge.id,
    });
    yield bookingPayment.save();

    let waiveworkPayment = new WaiveworkPayment({
      bookingId: booking.id,
      date: moment().add(nextDate - currentDay, 'days'),
      bookingPaymentId: null,
      amount: weeklyAmount,
    }); 
    yield notify.slack(
      {
        text: `${driver.link()} to be charged $${(
          proratedChargeAmount / 100
        ).toFixed(2)} for as the initial payment for
        their Waivework Rental`,
      },
      {channel: '#waivework-charges'},
    );
    yield waiveworkPayment.save();
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

    // See #907, this should really be removed in the future.
    // We are essentially looking for an incorrect query from
    // the app and fixing it ... what this group of code does 
    // is limit this totally incorrect anti-pattern way of
    // doing things to a very small subset, which makes it yet 
    // again another, different, and more nuanced problem to
    // find in the future.
    if (! _user.hasAccess('admin') &&
          Object.keys(query).length === 1 && 
          query.order === 'created_at,DESC'
       ) {
      dbQuery.include = [
        {
          model : 'BookingDetails',
          as    : 'details'
        }
      ];
    }


    dbQuery.limit = +query.limit || 20;
    dbQuery.offset = +query.offset || 0;

    if (query.order) {
      dbQuery.order = [ query.order.split(',') ];
    }

    if (!_user.hasAccess('admin') || query.type === 'mine') {
      dbQuery.where.user_id = _user.id;
    }

    bookings = yield Booking.find(dbQuery);

    // ### Prepare Bookings
    // Prepares bookings with payment, and file details.
    if (query.details) {
      for (let i = 0, len = bookings.length; i < len; i++) {
        bookings[i] = yield this.show(bookings[i].id, _user,  {nopath: true, nopayments: false, nofiles: true});
      }
    }

    if (query.includePath) {
      let paths = yield BookingLocation.find({
        where: {
          booking_id:{
            $in: bookings.map(x => x.id)
          }
        },
        order: [[ 'created_at', 'asc' ]],
        attributes: ['booking_id', 'latitude', 'longitude']
      });

      for(let i = 0; i < bookings.length; ++i) {
        bookings[i].carPath = paths.filter((x) => x.bookingId == bookings[i].id);
      }
    }
    if (query.includeWaiveworkPayment) {
      console.log('query: ', query.includePaymentAmount);
    }

    return bookings;
  }

  static *count(query, _user) {
    let bookingsCount    = null;
    let dbQuery     = queryParser(query, {
      where : {
        userId : queryParser.NUMBER,
        carId  : queryParser.STRING,
        status : queryParser.IN
      }
    });

    // This could save one db lookup ... we use this at the complete booking
    // and we're trying to speed things up.
    if (_user.id === query.userId || _user.hasAccess('admin')) {
      bookingsCount = yield Booking.count(dbQuery);
    } else {
      dbQuery.where.user_id = _user.id;
      bookingsCount = yield Booking.count(dbQuery);
    }

    return {bookingsCount: bookingsCount};
  }

  // this is a bullshit incompetent mess
  static *show(id, _user, opts) {
    let relations = {
      include : [
        {
          model : 'BookingDetails',
          as    : 'details'
        },
        {
          model      : 'BookingPayment',
          as         : 'payments',
          attributes : [ 'orderId' ],
        }
      ]
    };

    opts = opts || {};
    // ### Get Booking
    let booking = yield this.getBooking(id, relations);
    let user    = yield this.getUser(booking.userId);
    
    this.hasAccess(user, _user);

    // ### Prepare Booking

    booking.user     = user;

    // See #1077. Needs car's group when admin changes
    // switchers on cars/:id page
    let carOptions = {
      include: [
        {
          model : 'GroupCar',
          as    : 'tagList'
        }
      ]
    };
    booking.car      = yield Car.findById(booking.carId, carOptions);

    if(!opts.nopayments) {
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
      if (booking.payments) {
        booking.payments = booking.payments.filter(payment => (payment.description && !payment.description.match(/authorization/gi) || !payment.description));
      }
    }

    if(!opts.nopath) {
      if (booking.details && booking.details.length) {
        for (let i = 0, len = booking.details.length; i < len; i++) {
          let detail = booking.details[i];
          detail.parkingDetails = yield ParkingDetails.findOne({ where : { bookingDetailId : detail.id } });
        }
      }
    }


    if(!opts.nofiles) {
      booking.files = yield File.find({
        where : {
          collectionId : booking.collectionId || undefined
        }
      });
    }

    return booking;
  }

  static *getParkingDetails(id) {
    let details = yield ParkingDetails.find({ where: { bookingId: id } });
    if (details.length) {
      return { details: details[0] };
    } else {
      throw error.parse({
        code: 'PARKING_DETAILS_NOT_FOUND',
        message: 'Parking details not found',
      }, 404);
    }
  };

  static *extendForFree(id, _user, opts) {
    return yield this._extend(id, Object.assign(opts || {}, {free: true}), _user);
  }

  static *extend(id, query, _user) {
    return yield this._extend(id, query, _user);
  }

  static *_extend(id, opts, _user) {
    // extends reservation for $1.00 - see https://github.com/WaiveCar/Waivecar/issues/550
    yield redis.failOnMultientry('booking-extend', id, 20 * 1000);

    let booking = yield this.getBooking(id);
    let user    = yield this.getUser(booking.userId);
    let car     = yield this.getCar(booking.carId);
    let err     = false;

    let amount  = 100;
    let time    = 10;

    if(opts.howmuch == -1) {
      amount = -1;
      time = -1;
    }
    if(opts.howmuch == 20) {
      amount  = 420;
      time    = 20;
    }

    if(!('howmuch' in opts)) {
      let postparams = JSON.stringify({
        userId: user.id,
        carId: car.id,
        opts: {
          buyNow: fee,
          skipRush: true,
        }
      });
      let server = (process.env.NODE_ENV === 'production') ? 
         'https://api.waivecar.com' : 
         'http://staging.waivecar.com:4300';

      let buyNow = [
        "<script>function buyit_pCj8zFIPSkOiGq8zBlO1ng(el){",
          'el.removeAttribute("onclick");',
          `el.innerHTML="Thanks for using this beta feature. For now, just press the back button twice and you'll be in the rental.";`,
          'el.style.textDecoration="none";',
          'el.style.color="#fff";',
          'el.style.lineHeight="1.5em";',
          "var x=new XMLHttpRequest(),",
            "a=JSON.parse(localStorage['auth']);",
          `x.open('POST','${server}/bookings',true);`,
          "x.setRequestHeader('Authorization',a.token);",
          "x.setRequestHeader('Content-Type','application/json');",
          `x.send('${postparams}');`,
        "}</script>",
        `<div class='action-box' style='height:0'><button style='position:relative;top:60px;text-transform:none;color:lightblue' onclick="buyit_pCj8zFIPSkOiGq8zBlO1ng(this)" class="button button-dark button-link">(Beta feature) Get it now for $${fee}.00</button></div>`,
      ].join('');
      
      let buyOption = {
        title: `Get ${ car.license } now for $${fee}.00`,
        fee: fee,
        hotkey: 'now',
        priority: 'prefer',
        action: {verb:'post', url:'extend', params: postparams},
        internal: ['booking-service', 'extend', postparams]
      };
      if(opts.computeOnly) {
        return buyOption;
      }
    }

    if (_user) this.hasAccess(user, _user);

    if(booking.status !== 'reserved') {
      err = "You can only extend your time if you haven't started the ride.";
    }
    if(booking.isFlagged('extended')) {
      err = "Booking reservation has already been extended.";
    }

    if(!err) {
      if(opts.free || amount === -1 || (yield OrderService.extendReservation(booking, user, amount, time))) {
        yield booking.flag('extended');
        if(amount == -1) {
          yield booking.flag('extendinfinite');

          // POTENTIAL FOR FUTURE BUGS
          //
          // Currently we aren't using this value AND we really need the base
          // reservation time in order to compute an infinite extension fee
          // so instead of clearing it here, which is the "correct" thing to
          // do, we just leave it set.
          //
          // What a mess I'm making.
          //
          // yield booking.update({ reservationEnd: null });
          //
          if(!opts.silent) {
            yield notify.sendTextMessage(user, `Your reservation will be extended. Want to extend automatically? Reply "Save always".`);
            yield notify.notifyAdmins(`:snail: ${ user.link() } extended their reservation with ${ car.info() } *indefinitely*`, [ 'slack' ], { channel : '#reservations' });
          }
        } else {
          if(opts.howmuch == 20) {
            yield booking.flag('extend20');
          } 
          yield booking.update({
            reservationEnd: moment(booking.reservationEnd).add(time, 'minutes')
          });
          if(!opts.silent) {
            yield notify.sendTextMessage(user, `Your reservation has been extended ${ time } minutes. Want to extend automatically? Reply "Save always".`);
            yield notify.notifyAdmins(`:clock1: ${ user.link() } extended their reservation with ${ car.info() } by ${ time } minutes.`, [ 'slack' ], { channel : '#reservations' });
          }
        }

        booking.relay('update');
      } else {
        err = `Unable to charge $${(amount / 100).toFixed(2)} to your account. Reservation Extension failed.`;

        // Since it failed, we credit the user the dollar back since we didn't offer
        // the service. Additionally this should really be a red flag and we should
        // probably cancel the ride entirely... but let's not do that riht now.
        yield user.update({credit: user.credit + 100});
      } 
    }
    if(err) {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : err
      }, 400);
    }
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

  
  // Unlocks the car and lets the driver prepare before starting the ride. 
  // It also removes the car from parking spaces if it is in one
  static *ready(id, _user) {
    let booking = yield this.getBooking(id);
    let user    = yield this.getUser(booking.userId);
    let car     = yield this.getCar(booking.carId);

    let atHq = yield this.isAtHub(car);
    let isRush = booking.isFlagged('rush');

    if (atHq) {
      yield car.update({
        lastTimeAtHq: new Date(), 
      });
    }

    this.hasAccess(user, _user);

    // ### Verify Status

    if (booking.status !== 'reserved') {
      // we're calling this a second time, we are going to just pass through 
      // and succeed.
      if(booking.status === 'started') {
        return;
      }

      // the person didn't complete the last ride so what we try to do is tell them that
      // and just complete the ride
      if(booking.status === 'ended') {
        try {
          yield this._complete(id, _user);
        } catch(ex) {
          // We were unable to end the ride so we then have to explain why
          // a start ride is tripping us up.
          ex.message = "You haven't ended your previous ride and we can't do it automatically because \"" + ex.message + "\"";
          throw ex;
        }
      } else {
        throw error.parse({
          code    : `BOOKING_REQUEST_INVALID`,
          status  : booking.status,
          message : `You must be in 'reserved' status to start your ride, you are currently in '${ booking.getStatus() }' status.`
        }, 400);
      }
    }

    // Verify no one else has booked car
    if (car.userId !== user.id) {
      yield this.cancelBookingAndMakeCarAvailable(booking, car);
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `Another driver has already reserved this WaiveCar.`
      }, 400);
    }

    if (yield redis.shouldProcess('booking-start', booking.id)) {
      // ### Start Booking
      // 1. Delete the booking cancelation timer
      // 2. Log the initial details of the booking and car details.
      // 3. Start the free ride remind timer.
      // 4. Update the booking status to 'started'.
      // 5. Unlock the car and immobilizer.

      //
      // If the user has infinite extension time we charge their card 
      // now.  If it fails, we still give them the car, otherwise that'd 
      // be a real dick move. They'll have a debt and we'll try to 
      // collect later. Que sera sera
      //
      if(booking.isFlagged('extendinfinite')) {
        // our deal is $1.00 for the first 10 minutes + $.30/min thereafter
        //
        // NOTE THAT WE ARE USING booking.reservationEnd HERE. THIS IS POTENTIAL
        // FOR A FUTURE BUG IF WE EVER USE THAT VALUE PROPERLY
        //
        let minutesOver = Math.ceil( Math.max(0, (new Date() - booking.reservationEnd) / (1000 * 60) - 10));
        let fee = 100 + minutesOver * 30;

        try {
          yield OrderService.extendReservation(booking, user, fee, minutesOver + 10);
        } catch(ex) { }
      }

      yield booking.delCancelTimer();

      // This is what is used to actually calculate the overage time.
      yield this.logDetails('start', booking, car);

      yield booking.setReminders(user, config.booking.timers);
      // we are doing this in the booking loop now
      // yield booking.setForfeitureTimers(user, config.booking.timers);
      yield booking.start();

      // Rushed bookings start right away. We don't unlock the car yet.
      if(!isRush) {
        yield cars.accessCar(car.id, _user, car);
      }

      let lastBooking = yield car.getBooking(-1);
      if(lastBooking) {
        let lastUser = yield User.findById(lastBooking.userId);
        yield Tikd.removeLiability(car, lastBooking, lastUser);
      }
      yield Tikd.addLiability(car, booking, _user);

      // yield cars.openDoor(car.id, _user);

      yield ParkingService.vacate(car.id);

      // ### Notify

      let message = yield this.updateState('started', _user, user);
      yield notify.notifyAdmins(`:octopus: ${ message } ${ car.info() } ${ car.averageCharge() }% ${ booking.link() }`, [ 'slack' ], { channel : '#reservations' });
      if (user.isWaivework){
        yield notify.sendTextMessage(user, `Thanks for using WaiveWork! Your booking has started.`);
      } else {
        let isLevel = yield car.hasTag('level');
        let isCsula = yield car.hasTag('csula');
        let base = '', freetime = '2';

        if(isLevel) {
          base = 'the parking garage';
          freetime = '3';
        } else if(isCsula) {
          base = 'the parking spot you started at';
        } else {
          base = 'one of the highlighted zones on the map with at least 25mi charge';
        }
        if(!isRush) {
          yield notify.sendTextMessage(user, `${ freetime } free hours with ${ car.license } start now! If you have trouble starting the WaiveCar try pressing the "unlock" button in the app. When you're finished, return the WaiveCar to ${ base }. `);
        }
      }

      car.relay('update');
      yield this.relay('update', booking, _user);
    } else {
      yield notify.notifyAdmins(`:timer_clock: ${ user.link() } started a booking when it was being canceled. This was denied. ${ car.info() }.`, [ 'slack' ], { channel : '#reservations' });
    }
    queue.scheduler.cancel(
      'parking-notify-expiration',
      `parking-notify-expiration-${car.id}`,
    );
  }

  static *start(id, _user) {
    // This no longer server any purpose and was moved up to the ready method, we keeping this method in place
    // so that the app doesn't hit any errors when attempting to call it.
  }

  static *isAtHub(car) {
    var hub;
    (yield Location.find({
      where: {
        type: { 
          $in: ['hub', 'homebase'] 
        }
      } 
    })).forEach(function(row) {
      let radiusInMeters = row.radius > 1 ? row.radius : row.radius / 0.00062137; 
      if(geolib.getDistance(car, row) < radiusInMeters) {
        hub = row;
      }
    });
    return hub;
  }

  static *getZone(car, query=false) {
    var zone;

    if(!locationCache) {
      locationCache = yield Location.find({where: {type: 'zone'} });
    }

    locationCache.forEach(function(row) {
      if(_.isString(row.shape)) {
        row.shape = JSON.parse(row.shape).map((row) => { return {latitude:row[1], longitude:row[0]};});
      }
      if(geolib.isPointInside({latitude: car.latitude, longitude: car.longitude}, row.shape)){
        zone = row;
      }
    });
    if(query) {
      return zone && (zone.name.search(query) !== -1);
    }
    return zone;
  }

  static *finalCheckFail(_user, car, query) {
    if(_user.hasAccess('admin') && query.force) {
      return false;
    }
    let errors = [];
    if(process.env.NODE_ENV === 'production') {
      if (car.isIgnitionOn && !car.isCharging) {
        // if the car is charging and the charger is locked we unlock the vehicle so
        // that the user can remove the charger
        yield cars.unlockCar(car.id, _user, car);
        errors.push('turn off the ignition and if applicable, remove the charger'); 
      }
      if (!car.isKeySecure) { errors.push('secure the key'); }
      if (car.isDoorOpen) { errors.push('make sure the doors are closed');}
    }
      
    if (errors.length) {
      let message = `Your ride cannot be completed until you `;
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

      return {
        code    : `BOOKING_COMPLETE_INVALID`,
        message : message,
        data    : errors
      };
    }
  }

  // A more expensive check that updates the car status and makes sure
  // that the vehicle is in the right state to make ending legal.
  static *endCheck(id, _user, query, payload) {
    var booking = yield this.getBooking(id);
    var car     = yield this.getCar(booking.carId);
    let device  = yield cars.getDevice(car.id, _user, 'booking.complete');
    if(device) {
      yield car.update( device );
    } else {
      // we failed to contact the device at this time, let's not freak out and just try to go forward
    } 
    return yield this.finalCheckFail(_user, car, query);
  }


  // The meat of canEnd, the cheap check
  static *_canEndHere(car, isAdmin, user) {
    // We preference hubs over zones because cars can end there at any charge without a photo
    let hub = yield this.isAtHub(car);
    // if we are at a hub then we can return the car here regardless
    if(hub) {
      return hub;
    }

    // if our car is fine and we aren't at a hub then we can return it so long as
    // we are in a zone.
    let zone = yield this.getZone(car);
    // otherwise if we aren't there and the car is low, we need to go back to a hub
    if (car.milesAvailable() < 21 && !isAdmin) {
      throw error.parse({
        code    : `CHARGE_TOO_LOW`,
        message : `The WaiveCar's charge is too low to end here. Please return it to the homebase.`
      }, 400);
    }

    if(zone) {
      zone.isZone = true;
      return zone;
    } else if(!isAdmin) {
      throw error.parse({
        code    : `OUTSIDE_ZONE`,
        message : `You cannot return the WaiveCar here. Please end the booking inside the green zone on the map.`
      }, 400);
    }

    return isAdmin;
  }

  // A *very cheap* check to see if the ending spot it legal.
  static *canEndHere(id, _user, query, payload) {
    let booking = yield this.getBooking(id);
    let car     = yield this.getCar(booking.carId);
    let isAdmin = _user.isAdmin();
    // we look to see the last time we updated the car
    let lastUpdate = (new Date() - car.updatedAt) / (60 * 1000);

    // if we haven't updated the car's location in the past minute, we try to get it again.
    if(lastUpdate > 0.5) {
      let data = yield cars.getDevice(car.id, _user, 'booking.canend');
      if(data) {
        yield car.update(data);
      }
    }

    return yield this._canEndHere(car, isAdmin, _user);
  }

  // Ends the ride by calculating costs and setting the booking into pending payment state.
  static *end(id, _user, query, payload) {
    let lockKeys = yield redis.failOnMultientry('booking-end', id, 40 * 1000);

    let booking = yield this.getBooking(id);
    let car     = yield this.getCar(booking.carId);
    let user    = yield this.getUser(booking.userId);
    let isAdmin = _user.isAdmin();
    let warnings = [];

    // BUGBUG: We are using the user tagging and not the car tagging
    // for level accounts
    let isLevel = yield user.isTagged('level');
    let freeTime = booking.getFreeTime(isLevel);

    this.hasAccess(user, _user);

    // ### Status Check
    // Go through end booking checklist.
    if ([ 'ready', 'started' ].indexOf(booking.status) === -1) {
      if(['ended', 'completed'].indexOf(booking.status) !== -1) {
        return true;
      }
      yield redis.doneWithIt(lockKeys);
      throw error.parse({
        _status : booking.status,
        code    : `BOOKING_REQUEST_INVALID`,
        message : 'An error happened, please try again'
      }, 400);
    }

    var isCarReachable = true;
    if(process.env.NODE_ENV === 'production' && car.isIgnitionOn) {
      try {
        Object.assign(car, yield cars.getDevice(car.id, _user, 'booking.end'));
      } catch (err) {
        // BUGBUG: This is disabled until the new version of the app goes out
        // that can handle the pending end issue (#892).
        //isCarReachable = false;
        log.debug('Failed to fetch car information when ending booking');
        if (isAdmin) {
          warnings.push('car is unreachable');
        }
      }

      if (isCarReachable && car.isIgnitionOn) {
        if (isAdmin) {
          warnings.push('the ignition is on');
        } else {
          yield redis.doneWithIt(lockKeys);
          throw error.parse({
            code    : `BOOKING_REQUEST_INVALID`,
            message : `You must turn off the engine and remove any chargers before ending your booking.`
          }, 400);
        }
      }
    }

    let end = yield this._canEndHere(car, isAdmin, user);
    // Immobilize the engine.
    let status;
    try {
      if (isLevel) {
        // the easiest way to deal with that logic below
        // is just to lie. But I'm writing this at 4am
        // after working for 16 hours so there may be 
        // smarter ways.
        status = {isImmobilized: true};
        // When level rental ends, unlock the car
        yield cars.unlockCar(car.id, _user, car);
      } else {
        status = {isImmobilized: true};
        // this is now done at the end of the ride.
        //status = yield cars.lockImmobilizer(car.id, _user);
      }
    } catch (err) {
      log.warn(`Unable to lock immobilizer when ending booking ${ booking.id }`);
    }

    /*
    if (isCarReachable && (!status || !status.isImmobilized) ) {
      if (isAdmin) {
        warnings.push('the engine is not immobilized');
      } else {
        throw error.parse({
          code: `BOOKING_END_IMMOBILIZER`,
          message: `Immobilizing the engine failed.`
        }, 400);
      }
    }
    */

    if (isAdmin && warnings.length && !query.force) {
      yield redis.doneWithIt(lockKeys);
      throw error.parse({
        code    : `BOOKING_END`,
        message : `The booking can't be ended because ${ warnings.join(' and ')}.`
      }, 400);
    }

    // This is a timer to check the car some time period after they are ended
    // If everything is ok then the booking status goes to complete
    yield booking.setCompleteCheck();

    // Sets the car connected to the booking on a 5 minute auto lock timer.
    yield booking.setAutoLock();

    // ### Reset Car --- moved to _complete
    //yield car.removeDriver();

    //
    // --------------------------------------------------------
    //
    // At this point we've done all the checks and can safely
    // mark the booking as complete. This involves logging,
    // deleting timers and adding a row to the booking_details
    // table 
    // 
    // --------------------------------------------------------
    //
    let endDetails = yield this.logDetails('end', booking, car);

    // Create a shop cart with automated fees.
    yield fees.create(booking, car, _user);

    // End Booking
    yield booking.delReminders();
    yield booking.delForfeitureTimers();
    yield booking.end();
    if (!isCarReachable) {
      yield booking.flag("pending-end");
      yield notify.slack({ text : `Pending end of booking. ${ Bento.config.web.uri }/bookings/${ id }`}, { channel : '#adminended' });
    }

    let deltas = yield this.getDeltas(booking);

    // Parking restrictions:
    let parkingSlack;
    if (payload && payload.data && payload.data.type) {
      if (end.isZone && payload.data.streetHours < end.parkingTime) {
        throw error.parse({
          code    : 'NOT_ENOUGH_PARKING_TIME',
          message : 'Your parking is not valid for a long enough time.'
        }, 400);
      }
      let parkingText = '';
      payload.data.bookingId = id;

      parkingText += `Parked on street for ${ payload.data.streetHours }hr.  `;

      let message = yield this.updateState('ended', _user, user);

      parkingSlack = {
        text        : `:cherries: ${ message } ${ car.info() } ${ booking.link() }`,
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
        payload.data.path = payload.data.streetSignImage.path;
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

    // -------------------------------
    //
    // CHARGING THE USERS
    //
    // We need to make sure that we when we are here in the code there's essentially no
    // bullshit reason that we could still fail to succeed requiring a re-entry into this 
    // codeblock and a revisitation of this crap.
    //

    // Car charge reward program: #1306
    //
    // We want to be benevolent to the users who leave the cars better off then when they started.
    // Regardless of the charge we credit them here. This sends out notification for the reason and
    // it will be tallied prior to the charge.
    //
    if(deltas.charge > 0) {
      // we err in the user's favor by using the high estimates
      let miles = Math.floor((deltas.charge / 100) * car.getRange('LOW') * 0.98);
      let credit = Math.floor(miles / 5);
      if(credit > 0) {
        yield booking.addFlag('charge');
        yield OrderService.quickCharge({
          userId: booking.userId,
          amount: -(100 * credit),
          description: `Ending ${ car.license } with ${ miles } miles more than at the start!`
        }, null, {overrideAdminCheck: true});
      }
    }

    // Handle auto charge for time
    if (!isAdmin) {
      yield OrderService.createTimeOrder(booking, user);

    } else if(deltas.duration > freeTime) {
      yield notify.slack({ text : `:umbrella:Booking ended by admin. Time driven was over 2 hours. ${ Bento.config.web.uri }/bookings/${ id }`
      }, { channel : '#adminended' });
    }

    //
    // Slack Alerts: Scamming by booking without moving #468
    //
    // If a user ends a ride, and the booking is longer than 10 minutes, but they have driven 0 miles, send an alert to the "User Alerts" Channel.
    // Alert text: "{User Name} had booking with 0 miles driven for X minutes. {User phone number} {link to user profile}."
    // (People do this to 'hold' the car for a while).
    //
    // One car, Waive17 had a bug where it wasn't reporting the odometer increasing. This caused a false positive report here. So we've added
    // a second check, to see if the car's GPS from the start of the ride and the end of the ride are dramatically different from each other.
    // 
    if(deltas.duration > 10 && deltas.distance === 0 && !deltas.hasMoved) {
      yield UserLog.addUserEvent(user, 'SIT', booking.id, deltas.duration);
      yield notify.slack({ text : `:popcorn:${ user.link() } drove 0 miles for ${ deltas.duration } minutes. ${ booking.link() }`
      }, { channel : '#user-alerts' });
    }

    let message = yield this.updateState('ended', _user, user);
    yield notify.slack(parkingSlack || { text : `:cherries: ${ message } ${ car.info() } ${ car.averageCharge() }% ${ booking.link() }`
    }, { channel : '#reservations' });
    yield LogService.create({ bookingId : booking.id, carId : car.id, userId : user.id, action : Actions.END_BOOKING }, _user);

    // ### Relay Update

    car.relay('update');
    yield this.relay('update', booking, _user);
    yield redis.doneWithIt(lockKeys);

    if (booking.isFlagged('Waivework')) {
      let waiveworkPayment = yield WaiveworkPayment.findOne({
        where: {
          bookingId: booking.id,
          bookingPaymentId: null,
        }
      });
      if (waiveworkPayment) {
        yield waiveworkPayment.delete();
      }
      yield notify.slack(
        {
          text: `Autopay for ${user.link()} has been stopped due to their booking being ended`,
        },
        {channel: '#waivework-charges'},
      );
      // TODO: Possibly make it refund a prorated amount to the user here?
    }

    return {
      isCarReachable : isCarReachable
    };
  }

  static *notifyUsers(car) {
    /*
    let peopleToTell = yield User.find({ where : { notifyEnd : { $gt : new Date() } } });
    let closePeople = peopleToTell.filter((who) => geolib.getDistance(who, car) < 750);
    if(!closePeople.length) {
      console.log(`Nobody is nearby ${ car.license }`);
    }
    if(closePeople.length > 1) {
      console.log(`${ closePeople.length } are nearby ${ car.license }! This is a bug!`);
    }
    let WhoToTell = closePeople[0];

    let address = yield this.getAddress(car.latitude, car.longitude);
    if(address) {
      address = ` at ${address}`;
    }
    //let message = `${ car.license } (${ car.getRange() }mi)${ address } is now reserved. Reply "abort" to cancel this booking or "be quiet" to cancel your remaining ${ time }m of dib time`;

    for(var ix = 0; ix < peopleToTell.length; ix++) {
      yield notify.sendTextMessage(peopleToTell[ix], message);
    }
    */
  }

  static *complete(id, _user, query, payload) {
    try { 
      return yield this._complete(id, _user, query, payload);
    } catch(ex) {
      console.log(ex);
      throw error.parse(ex, 400);
    }
  }

  static *cancelBookingAndMakeCarAvailable(booking, car) {
    if(!car) {
      let car = yield this.getCar(booking.carId); 
    }

    let isLevel = yield car.isTagged('level');
    yield booking.cancel();
    yield booking.delCancelTimer();
    yield booking.delForfeitureTimers();
    yield car.removeDriver();
    yield car.available();
    yield this.notifyUsers(car);

    // See #1164 leave cars unavailable between 1-5am
    var hour = (new Date()).getHours();
    if(isLevel || hour < 4 || hour > 7) {
      car.relay('update');
    }
    booking.relay('update');
  }

  // Locks, and makes the car available for a new booking.
  static *_complete(id, _user, query, payload) {
    let lockKeys = yield redis.shouldProcess('booking-complete', id);
    let errorAtEnd = false;
    let details;
    if (!lockKeys) {
      return;
    }

    var isAdmin = _user.hasAccess('admin');
    try {
      let relations = {
        include : [
          {
            model : 'BookingDetails',
            as    : 'details'
          }
        ]
      };
      var booking = yield this.getBooking(id, relations);
      var car     = yield this.getCar(booking.carId);
      var user    = yield this.getUser(booking.userId);
      var isLevel = yield user.isTagged('level');
      var isCsula = yield car.hasTag('csula');

      this.hasAccess(user, _user);

      if (booking.status !== 'ended') {
        yield this.end(id, _user, query, payload);
        if (booking.status !== 'ended') {
          yield redis.doneWithIt(lockKeys);
          throw {
            code    : `BOOKING_REQUEST_INVALID`,
            message : `You cannot complete a booking which has not yet ended.`
          };
        }
      }

      // ### Validate Complete Status
      // Make sure all required car states are valid before allowing the booking to
      // be completed and released for next booking.

      let res = yield this.finalCheckFail(_user, car, query);
      // if it looks like we'd fail this, then and only then do we probe the device one final time.
      if(res) {
        try {
          yield car.update( yield cars.getDevice(car.id, _user, 'booking.complete') );
        } catch (err) {
          log.warn(`Failed to update ${ car.info() } when completing booking ${ booking.id }`);
        }
        res = yield this.finalCheckFail(_user, car, query);
        if(res) {
          yield redis.doneWithIt(lockKeys);
          throw res;
        }
      }

      details = yield BookingDetails.find({
        where: {
          bookingId: booking.id
        }
      });

      /*
      let sumQuery = yield sequelize.query(`select type, sum(mileage) as total from booking_details join bookings on booking_details.booking_id = bookings.id where user_id=${user.id} group by type;`);
      let totalMiles = Math.abs(sumQuery[0][1].total - sumQuery[0][0].total);
      let lastTripDistance = Math.abs(details[1].mileage - details[0].mileage);
      let beforeLastTrip = totalMiles - lastTripDistance;
      // This email will be sent for every 500 miles a user drives
      if (Math.floor(totalMiles / 500) !== Math.floor(beforeLastTrip / 500)) {
        let email = new Email();
        let numMonths = Math.ceil(moment(Date.now()).diff(moment(user.createdAt), 'months'));
        let allBookings = yield Booking.find({where: {userId: user.id}});
        let gallons = Math.ceil(totalMiles / 24.7);
        try {
	        yield email.send({
		        to       : user.email,
		        from     : emailConfig.sender,
            subject  : `You just drove your ${Math.floor(totalMiles)}th mile with WaiveCar!`,
		        template : 'drove-x-miles',
		        context  : {
		          name       : user.name(),
              numMonths,
              numBookings: allBookings.length,
              gallons,
              pounds: Math.ceil(gallons * 19.6),
              savings: (totalMiles * 0.545).toFixed(2),
		        }
          });
        } catch(err) {
          log.warn('email error: ', err);
        }; 
      }
      */

      // --- 
      //
      // By this point we assume that the user is allowed to end the booking
      // at the charge/location the car is currently at. If that's not true, 
      // then you need to yell at the user above this.
      //
      // ---

    } catch(ex) {
      if (!(query && query.force) || !booking || !car || !user) {
        yield redis.doneWithIt(lockKeys);
        throw ex;
      }
    }
    try { 
      if (!isLevel) { 
        yield cars.lockCar(car.id, _user);
        yield cars.lockImmobilizer(car.id, _user);
        // This was causing problems ... I'd rather have booking ending having issues
        // then cars being idle and unlocked
        // yield booking.setNowLock({userId: _user.id, carId: car.id});
      }
    } catch(ex) {
      if(ex.code === 'TAG_WARNING') {
        errorAtEnd = ex;
      } else if (!(query && query.force) || !booking || !car || !user) {
        yield redis.doneWithIt(lockKeys);
        throw ex;
      }
    }

    yield booking.complete();
    yield car.removeDriver();

    if (user.isProbation()){
      yield user.setActive();
    }

    // If car is under 25% make it unavailable after ride is done #514
    // We use the average to make this assessment.

    let zone = {}, zoneString = '', address = '';
    let minCharge = 25;

    try {
      zone = (yield this.getZone(car)) || {};
      minCharge = zone.minimumCharge;
      zoneString = `(${zone.name})` || '';
    } catch(ex) {}

    // see https://github.com/WaiveCar/Waivecar/issues/1455#issuecomment-439516353
    if (isCsula) {
      minCharge = 50;
    }

    if (car.milesAvailable() <= minCharge && !isAdmin && !isLevel) {
      yield cars.updateAvailabilityAnonymous(car.id, false);
      yield notify.slack({ text : `:spider: ${ car.link() } unavailable due to charge being under ${minCharge}mi. ${ car.chargeReport() }` }, { channel : '#rental-alerts' });

      if(isCsula) {
        // we email michael.dray@calstatela.edu with the car number
        // and charge.
        yield (new Email()).send({
          to: 'michael.dray@calstatela.edu',
          from: emailConfig.sender,
          subject: `${car.license}'s at ${car.milesAvailable()}mi est. fuel and was made unavailable for booking`,
          template: 'blank'
        });
      }
    } else {
      yield car.available();
      yield this.notifyUsers(car);
    }

    let message = yield this.updateState('completed', _user, user);
    let rebookCost = booking.isFlagged('rebook') ? 13 : 5;
    let stats = "(" + [
      ((details[1].mileage - details[0].mileage) * 0.621371).toFixed(2) + "mi",
      (details[1].charge  - details[0].charge) + "%",
      Math.round((details[1].createdAt - details[0].createdAt) / 60000) + "min"
    ].join(" ") + ")";

    yield notify.sendTextMessage(user, `You're done! Reply "rebook" to rebook for $${rebookCost}. Forget something? Reply "unlock" to get it in the next 5min.`);
    yield notify.slack({ text : `:coffee: ${ message } ${ car.info() } ${ stats } ${ zoneString } ${ address } ${ booking.link() }` }, { channel : '#reservations' });
    yield LogService.create({ bookingId : booking.id, carId : car.id, userId : user.id, action : Actions.COMPLETE_BOOKING }, _user);

    queue.scheduler.add('user-liability-release', {
      uid: `user-liability-release-${booking.id}`,
      timer: {value: (zone.parkingTime || 0), type: 'hours'},
      data: {
        bookingId: booking.id,
        userId: user.id,
        carId: car.id,
      },
    });

    // Notify slack, create a ticket to move car, also need to create tickets to be created that close if the car is moved
    // This also needs to be made compatible with the changes I made in the last ticket I worked on.

    // Admins will be notified of expiring parking 30 mins before expiration if parking is shorter than 5 hours
    // and 90 mins before if it is longer


    // If there are parking details, a slack notification is sent out close to expiration
    /*
    let details = yield ParkingDetails.findOne({
      where: {
        bookingId: id,
      }
    });

    // This implementation has proven to be unuseful
    if (details) {
      let notificationTime = details.streetHours < 5 ? 30 : 90; 
      let timerObj = {value: notificationTime, type: 'minutes'};

      queue.scheduler.add('parking-notify-expiration', {
        uid: `parking-notify-expiration-${car.id}`,
        timer: timerObj,
        unique: true,
        data: {
          notificationTime,
          bookingId: booking.id,
          userId: user.id,
          carId: car.id,
          zone,
          address,
        },
      });
    }
    */
    // ### Relay

    // if it's between 1am and 5am (which is 4 and 8 according to our east coast servers), then
    // we make the car available while disabling the relaying of the message back to the app #1164
    var hour = (new Date()).getHours();
    if(isLevel || hour < 4 || hour > 7) {
      car.relay('update');
    }
    yield this.relay('update', booking, _user);
    if(errorAtEnd) {
      throw errorAtEnd;
    }
  }

  // Closes a booking, this method is run when no payment is needed.
  static *close(id, _user) {
    let booking = yield this.getBooking(id);
    yield booking.close();
    yield this.relay('update', booking, _user);
  }

  static *cancelForfeit(id, _user) {
    let booking = yield this.getBooking(id);

    if ( _user.hasAccess('admin')) {
      yield booking.delForfeitureTimers();
      yield booking.addFlag('cancelforfeit');
      yield this.relay('update', booking, _user);
    }
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

  static *cancel(id, _user) {
    let booking = yield this.getBooking(id);
    let car     = yield this.getCar(booking.carId);
    let user    = yield this.getUser(booking.userId);
    let states  = [ 'reserved', 'pending' ];

    this.hasAccess(user, _user);

    // ### Verify Status

    // This is a double cancel bug and we just pass them through
    if (booking.status === 'cancelled') {
      // just ignore it and don't worry about it.
      return true;
    }

    if (states.indexOf(booking.status) === -1) {
      throw error.parse({
        code    : `BOOKING_REQUEST_INVALID`,
        message : `You cannot cancel a booking that is ${ booking.getStatus() }, please end your ride.`
      }, 400);
    }

    yield this.cancelBookingAndMakeCarAvailable(booking, car);

    if(booking.isFlagged('extendinfinite')) {
      //
      // NOTE THAT WE ARE USING booking.reservationEnd HERE. THIS IS POTENTIAL
      // FOR A FUTURE BUG IF WE EVER USE THAT VALUE PROPERLY
      //
      let minutesOver = Math.ceil( Math.max(0, (new Date() - booking.reservationEnd) / (1000 * 60) - 10));
      let fee = 100 + minutesOver * 30;

      try {
        yield OrderService.extendReservation(booking, user, fee, minutesOver + 10);
      } catch(ex) { }
    }

    // We consider a cancellation as effectively a reset
    yield this.updateState('completed', _user, user);
    let message = (_user.id === user.id) ?
      `${ _user.link() } cancelled` :
      `${ _user.name() } cancelled for ${ user.link() }`;

    let rebookCost = booking.isFlagged('rebook') ? 13 : 5;
    yield notify.sendTextMessage(user, `Your reservation is cancelled. Reply "rebook" to rebook now for $${rebookCost}.00.`);
    yield notify.slack({ text : `:pill: ${ message } ${ car.info() } ${ booking.link() }`
    }, { channel : '#reservations' });
  }

  static *checkCarParityWithUser(id, payload, user) {
    if (!Array.isArray(payload.userLocations) || payload.userLocations.length == 0 || !payload.appNowTime) {
      throw error.parse({
        code    : 'INVALID_PAYLOAD',
        message : 'Invalid payload'
      }, 404);
    }

    let booking = yield this.getBooking(id);
    if(booking.status !== 'started') {
      return;
    }

    let now = new Date();
    let timeWindowWidth = config.booking.parityCheckTimeWindow * 1000;

    let userLocations = payload.userLocations.map( location => {
     return {
       latitude: location.latitude,
       longitude: location.longitude,
       accuracy: location.accuracy,
       time: new Date( location.timestamp - payload.appNowTime + now.getTime())
     }
    });

    let params = {
      attributes: ['id', 'latitude', 'longitude', /*'hdop', */ 'created_at'],
      where: { booking_id: id, created_at : { $gt : new Date(now.getTime() - timeWindowWidth)  } },
      order: [ ['created_at', 'asc'] ]
    };

    if(userLocations.length > 0) {
      yield user.update({
        latitude: userLocations[0].latitude,
        longitude: userLocations[0].longitude
      });
    }

    let carLocations = yield BookingLocation.find(params);

    let carLocationsWithNearestInTimeUserLocation = carLocations.map(location => { 
      let closestUserLocation = _.min( userLocations.map(userLocation => {
        return {
          userLocation: userLocation,
          carLocation: location,
          timeDiff: Math.abs(userLocation.time - location.createdAt)
        }
      }), "timeDiff");

      return closestUserLocation;
    });

    let closestLocations = _.min(carLocationsWithNearestInTimeUserLocation, "timeDiff");
    // we start with this set to true in case we don't have 
    // any matches so we don't get of false positives.
    let isPaired = true;

    var distance = 0;
    var distanceError;

    if (closestLocations.timeDiff < timeWindowWidth) {
      distanceError = 6000 + (closestLocations.timeDiff / 1000) * 20; //20 m/c is around 45 mile per hour
      distance = geolib.getDistance(closestLocations.userLocation, closestLocations.carLocation);
      isPaired = distance < distanceError;
    }

    if (!isPaired && Math.random() * 5 < 1) {
      let car     = yield Car.findById(booking.carId);
      let link = [closestLocations.userLocation.latitude, closestLocations.userLocation.longitude].join(',');
      yield notify.notifyAdmins(`:airplane: Location check failed on ${ booking.link()}. ${ user.link() } is <https://www.google.com/maps/?q=${link} | ${ (0.000621371 * distance).toFixed(2) }mi> from ${car.license}.`, [ 'slack' ], { channel : '#rental-alerts' });
    }

    // save user and car position into a file for research
    let lastCarPos = carLocations.pop();
    if(lastCarPos) {
      let positionInfo = {
        bookingId: id,
        userId: user.id,
        carId: lastCarPos.id,
        userLocation: userLocations,
        carLocation: lastCarPos,
        time: new Date()
      };
      fs.appendFile('/var/log/outgoing/user-gps.txt', JSON.stringify(positionInfo) + '\n', function(){});
    }

    return { isPaired: isPaired };
  }

  static *userContribution(id, _user) {

    if (_user.id == id || _user.hasAccess('admin')) {

      var stats = {
        rentedTotal : 0,
        mileageTotal : 0,
        payedTotal: null
      };

      var result = yield sequelize.query(`select sum(TIME_TO_SEC(timediff(bookings.updated_at, bookings.created_at))) as rented_total
                              from bookings
                              where user_id = ? and status = 'completed'`, {
        type         : sequelize.QueryTypes.SELECT,
        replacements : [ id ]
      });

      if (result.length == 1 && result[0]) {
        stats.rentedTotal = result[0].rented_total;
      }

      var result = yield sequelize.query(`
        select sum(ends_mileage - starts_mileage) as mileage_total, count(*) as number_of_rides from (

            select min(starts.mileage) as starts_mileage, max(ends.mileage) as ends_mileage, max(ends.mileage) - min(starts.mileage)
                from bookings
                join booking_details as starts
                  on starts.booking_id = bookings.id and starts.type='start'
                join booking_details as ends
                  on ends.booking_id = starts.booking_id and ends.type='end'
                where user_id = ? and status = 'completed'  group by starts.booking_id

        ) as R
      `, {
        type         : sequelize.QueryTypes.SELECT,
        replacements : [ id ]
      });

      if (result.length == 1 && result[0]) {
        stats.mileageTotal = result[0].mileage_total;
        stats.numberOfRides = result[0].number_of_rides;
      }

      if (_user.hasAccess('admin')) {
        var result = yield sequelize.query(`select sum(amount) as payed_total from shop_orders where user_id = ? and status = 'paid'`, {
          type: sequelize.QueryTypes.SELECT,
          replacements: [id]
        });

        if (result.length == 1 && result[0]) {
          stats.payedTotal = result[0].payed_total;
        }
      }

      return stats;
    }
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

  
  // Updates all details with missing address stamps.
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

  // ### HELPERS
  static *relay(type, booking, _user) {
    let payload = {
      type : type,
      data : yield this.show(booking.id, _user, {nopath: true, nopayments: true, nofiles: true})
    };
    relay.user(booking.userId, 'bookings', payload);
    relay.admin('bookings', payload);
  }

  static *logDetails(type, booking, car) {
    //
    // see 1329: Fix multiple end and multiple start
    //
    // There's an issue fundamental to restart that we
    // are trying to avoid (see #1330 for the details)
    //
    // We are trying to make sure we aren't logging things
    // twice. This is a last-ditch protection for it and
    // it shouldn't be required. But famous last words...
    //
    let check = yield BookingDetails.find({
      where: {
        bookingId : booking.id,
        type      : type
      }
    });

    if(check && check.length > 0) {
      return check[0];
    }

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
    let ret = {duration: 0, distance: 0, hasMoved: false};

    // We're using essentially Euclidean distance here and a routine that was developed for Google Maps refresh optimization in commit id
    // 6f033cba based on long/lat -> distances relative to around santa monica/soca.
    if (start && end) {
      ret.duration = moment(end.createdAt).diff(start.createdAt, 'minutes');
      ret.distance = end.mileage - start.mileage;
      let absDistance = Math.abs(start.latitude - end.latitude) + Math.abs(start.longitude - end.longitude);
      ret.hasMoved = absDistance > 0.00005;
      //console.log(`<< ${ret.distance} ${ret.duration} ${absDistance}`);
    }
    ret.charge = end.charge - start.charge;

    return ret;
  }

  // getAddress has been moved to the geocoding services.
  // A reference has been left here for legacy compatibility
  // cjm 20180605
  static *getAddress(lat, long, param) {
    return yield geocode.getAddress(lat, long, param); 
  }

  static *willRushFail(car) {
    let timezone = (yield car.hasTag('level')) ? 'America/New_York' : 'America/Los_Angeles';
    var hour = moment().tz(timezone).format('H');
    let startHour = 22;
    let endHour = 8;

    if(hour >= startHour || hour < endHour) {
      if(car.milesAvailable() < 80) {
        return `WaiveRush isn't available with low cars. Look for green cars on the map`;
      }
    } else {
      return `WaiveRush is only offered between ${startHour}:00 and ${endHour}:00.`;
    }
  }

  static *offerWaiveRush(user, car, opts = {}, lockKeys) {
    var hour = moment().tz('America/Los_Angeles').format('H');

    let startHour = 22;
    let generalRental = 4;
    let endHour = 8;

    if(!opts.skipRush) {

      // See if we can do a rush at this time.
      let failureReason = yield this.willRushFail(car);

      // If we cannot, we only care to bug the user
      // if they were asking to do it.
      if(failureReason) {
        if(opts.rush) {
          yield redis.doneWithIt(lockKeys);
          throw error.parse({
            code    : 'WAIVE_RUSH',
            message : failureReason
          }, 400);
        } 
        return true;
      }

      // We've already said yes.
      if(opts.rush) {
        return true;
      }

      let remaining = 9 - (hour >= startHour ? hour - 24 : hour);
      
      // We want to make sure if the user backs out we still charge them the rebook fee
      let decline = yield this.rebookCheck(user, car, {computeOnly: true});
      if(decline) {
        opts.fee = opts.fee || 5;
        decline.title = `No thanks. Rebook for $${opts.fee}.00`;
        decline.priority = 'ignore';
      } else {

        // After $generalRental, cars can be booked for free always.
        if(hour >= generalRental && hour < startHour) {
          let normalBooking = JSON.stringify({
            userId: user.id,
            carId: car.id,
            opts: {
              skipRush: true
            }
          });
          decline = {
            title: 'No thanks. Regular booking please.',
            priority: 'ignore',
            action: {verb:'post', url:'bookings', params:normalBooking},
            internal: ['booking-service','create', normalBooking]
          };
        } else {
          // otherwise you need to find a low car or wait.
          decline = {
            title: `I'll find a low car`,
            priority: 'ignore',
            theme: 'dark',
            action: false
          };
        }
      };
      let rushParams = JSON.stringify({
        userId: user.id,
        carId: car.id,
        opts: {
          rush: true
        }
      });

      // this shit app doesn't have this crap fixed because it's such a pain to work with so I fix it here.
      let inject = ['<img style=display:none src=a onerror="if(!window.location.href.search(/basic/)){',
       "this.parentNode.previousSibling.previousSibling.innerHTML='WaiveRush Opportunity!';",
       "this.parentNode.parentNode.getElementsByTagName('svg')[0].style.display='none';",
       '}">'
      ].join('');

      yield redis.doneWithIt(lockKeys);
      throw error.parse({
        code    : 'WAIVE_RUSH',
        title   : 'WaiveRush Opportunity!',
        message : `<div style=text-align:left>Keep ${ car.license } until 10AM for a flat fee. Your reservation will not expire and hourly charges won't begin until 10AM!<br><br><small><b>Notice:</b> There is no customer service available between 10PM and 9AM.\nFind a low car for a normal WaiveCar booking.</small></div>${ inject }`,
        options: [{
          title: `WaiveRush for $14.99!`,
          priority: 'prefer',
          hotkey: `Rush ${ car.license }`,
          action: {verb:'post', url:'bookings', params: rushParams},
          internal: ['booking-service', 'create', rushParams]
        }, decline
        ]
      }, 400);
    }

  }

  // We see if someone is hoarding the car (defined as 50% or more of the past 6 successful bookings.
  static *lookForHoarding(user, car) {
    let limit = 9;
    let lastBookingList = yield Booking.find({
      where : {
        carId  : car.id,
        status : { $in: ['ended', 'completed', 'closed'] }
      },
      order : [
        [ 'created_at', 'DESC' ]
      ],
      limit: limit
    });
    // this is done AFTER a successful booking so we need to start at 1.
    let count = 1;
    limit ++;
    lastBookingList.forEach(row => count += (row.userId === user.id));
    return [count / limit, count, limit];
  }

  static *lookForHolding(user, car) {
    //
    // See https://github.com/waivecar/Waivecar/issues/497
    //
    // The logic here is that we are going to try to see if this is under say, XX minutes and there
    // is another booking in between. 
    
    // We now look for a booking in between.
    let lastBooking = yield Booking.findOne({
      where : {
        carId  : car.id,
        status : { $in: ['cancelled', 'completed'] }
      },
      include: [ 
        {
          model: 'BookingDetails',
          as: 'details',
        }
      ],
      order : [
        [ 'created_at', 'DESC' ]
      ]
    });

    if(lastBooking && moment().diff(lastBooking.getEndTime(), 'minutes') < 0.5) {
      // If the most recent booking is not by the user booking 
      // (but the user had booked within our margin) then we call
      // it suspicious but let thing go ahead.
      if(lastBooking.userId != user.id) {
        let holder = yield User.findById(lastBooking.userId);

        let scam = (lastBooking.status === 'completed') ? 'SWAPPING': 'HOLDING';
        let duration = lastBooking.getDurationInMinutes();
        if(scam === 'SWAPPING' && (duration > 200 || (duration < 102 && duration > 17))) {
          return;
        }
        // We tarnish both users' stellar records.
        yield UserLog.addUserEvent(user, scam, holder.id, holder.name());
        yield UserLog.addUserEvent(holder, scam, user.id, user.name());

        if(scam === 'HOLDING') {
          yield notify.notifyAdmins(`:dark_sunglasses: ${ holder.link() } may have been holding a car for ${ user.link() }.`, [ 'slack' ], { channel : '#user-alerts' });
        }
        if(scam === 'SWAPPING') {
          yield notify.notifyAdmins(`:couple: ${ holder.link() } (${Math.round(lastBooking.getDurationInMinutes())}min booking) may be swapping ${ car.link() } with ${ user.link() }.`, [ 'slack' ], { channel : '#user-alerts' });
        }
      }
    }
  }

  // Determines if user has booked car recently
  static *rebookCheck(user, car, opts, lockKeys) {
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
    opts = opts || {};

    let minutesLapsed = moment().diff(booking.updatedAt, 'minutes');
    let minutesStarted = moment().diff(booking.createdAt, 'minutes');
    let minTime = 25;
    let rebookOrder;
    let baseline = 0;

    if(booking.status === 'cancelled') {
      minTime += 5;
    }

    if (minutesLapsed < minTime) {
      if(opts.buyNow) {
        if (booking.isFlagged('charge')) {
          yield notify.slack({ text : `:checkered_flag: The clever ${ user.link() }, booked ${ car.link() } ${ minutesStarted }min ago, charged it and then rebooked it.` }, { channel : '#rental-alerts' });
          yield UserLog.addUserEvent(user, 'CHARGE-REBOOK', booking.id, `${car.link()} ${ minutesStarted }`);
        }

        rebookOrder = yield OrderService.getCarNow(booking, user, opts.buyNow * 100);
        if (rebookOrder) {
          return rebookOrder;
        }
      }

      let remainingTime =  Math.max(1, Math.ceil(minTime - minutesLapsed));

      // This is a second rebook of the vehicle, we are going to make this far less attractive.
      let append = '';
      if (booking.isFlagged('rebook')) {
        baseline = 8;
        append = ' another time';
      }
      let fee = Math.ceil(remainingTime / minTime * 5) + baseline;
      let creditClaim = '';
      let postparams = JSON.stringify({
        userId: user.id,
        carId: car.id,
        opts: {
          buyNow: fee,
          skipRush: true,
        }
      });
      let server = (process.env.NODE_ENV === 'production') ? 
         'https://api.waivecar.com' : 
         'http://staging.waivecar.com:4300';

      let buyNow = [
        "<script>function buyit_pCj8zFIPSkOiGq8zBlO1ng(el){",
          'el.removeAttribute("onclick");',
          `el.innerHTML="Thanks for using this beta feature. For now, just press the back button twice and you'll be in the rental.";`,
          'el.style.textDecoration="none";',
          'el.style.color="#fff";',
          'el.style.lineHeight="1.5em";',
          "var x=new XMLHttpRequest(),",
            "a=JSON.parse(localStorage['auth']);",
          `x.open('POST','${server}/bookings',true);`,
          "x.setRequestHeader('Authorization',a.token);",
          "x.setRequestHeader('Content-Type','application/json');",
          `x.send('${postparams}');`,
        "}</script>",
        `<div class='action-box' style='height:0'><button style='position:relative;top:60px;text-transform:none;color:lightblue' onclick="buyit_pCj8zFIPSkOiGq8zBlO1ng(this)" class="button button-dark button-link">(Beta feature) Get it now for $${fee.toFixed(2)}</button></div>`,
      ].join('');
      
      let buyOption = {
        title: `Get ${ car.license } now for $${fee.toFixed(2)}`,
        fee: fee,
        priority: 'prefer',
        action: {verb:'post', url:'bookings', params: postparams},
        internal: ['booking-service', 'create', postparams]
      };

      if(opts.computeOnly) {
        return buyOption;
      }

      if(user.credit - (fee * 100) > 100) {
        creditClaim = ` (You have $${ (user.credit/100).toFixed(2) } in credit!)`;
      }

      yield redis.doneWithIt(lockKeys);

      throw error.parse({
        code    : 'RECENT_BOOKING',
        title   : `Rebook the same WaiveCar${append}`,
        message : `Sorry! You need to wait ${remainingTime}min more to rebook ${ car.license }${ append } for free!${ creditClaim }`,
        options : [
          buyOption,
          {
            title: "No thanks! I'll risk losing it.",
            priority: 'ignore',
            theme: 'dark',
            action: false
          }]
      }, 400);
    }
  }
};
