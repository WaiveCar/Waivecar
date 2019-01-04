'use strict';

let co          = require('co');
let request     = require('co-request');
let Service     = require('./classes/service');
let CartService = require('./cart-service');
let moment      = require('moment-timezone');
let _           = require('lodash');
let UserLog     = require('../../log/lib/log-service');
let Email       = Bento.provider('email');
let queryParser = Bento.provider('sequelize/helpers').query;
let User        = Bento.model('User');
let Car         = Bento.model('Car');
let Cart        = Bento.model('Shop/Cart');
let Card        = Bento.model('Shop/Card');
let Order       = Bento.model('Shop/Order');
let OrderItem   = Bento.model('Shop/OrderItem');
let Booking     = Bento.model('Booking');
let BookingDetails = Bento.model('BookingDetails');
let BookingPayment = Bento.model('BookingPayment');
let RedisService   = require('../../waivecar/lib/redis-service');
let UserService = require('../../user/lib/user-service');
let notify      = Bento.module('waivecar/lib/notification-service');
let hooks       = Bento.Hooks;
let redis       = Bento.Redis;
let error       = Bento.Error;
let config      = Bento.config.shop;
let emailConfig = Bento.config.email;
let log         = Bento.Log;
let apiConfig   = Bento.config.api;

let stripe = require('./stripe');

module.exports = class OrderService extends Service {

  // Apparently you can't just charge a user without filling up a fucking
  // "cart" first. That's asinine bullshit and absolutely ridiculous. So
  // we are subverting that by copying the code below (see *create) and
  // removing all the overlapping dependency anti-patterned nonsense.
  // I mean god damn...
  static *quickCharge(data, _user, opts) {
    let user = yield this.getUser(data.userId);
    let charge = {amount: data.amount};
    opts = opts || {};

    if (
      !opts.overrideAdminCheck && 
      // if we aren't an admin, this may be ok
      !_user.hasAccess('admin') && (
        // we have to be modifying ourselves
        // and we are only allowed to clear our balance
        user.id !== _user.id ||
        data.amount !== 0 
      )
    ) {
      throw error.parse({
        code    : `FORBIDDEN`,
        message : `This operation is forbidden`
      }, 400);
    }
      
    data.currency = 'usd';
    //data.currency || 'usd';
    //this.verifyCurrency(data.currency);

    if(data.amount === 0) {
      data.description = "Clearing outstanding balance";
    }

    if(!data.description) {
      data.description = "Miscellaneous " + (data.amount > 0 ? "Fees" : "Credit");
    }

    if(!_user) {
      _user = {id: 0, name: function() { return "The Computer"; }};
    }

    let order = new Order({
      createdBy   : _user.id,
      userId      : data.userId,
      source      : data.source,
      description : data.description,
      metadata    : data.metadata,
      currency    : data.currency,
      amount      : data.amount
    });
    yield order.save();

    try {
      // The order here matters.  If a charge fails then only the failed charge will appear
      // as a transgression, not the fee itself.  So we need to log this prior to the charge
      if(data.amount > 0) {
        yield UserLog.addUserEvent(user, 'FEE', order.id, `$${(data.amount/100).toFixed(2)} ${data.description}`);
      } else {
        yield UserLog.addUserEvent(user, 'CREDIT', order.id, `$${(data.amount/100).toFixed(2)} ${data.description}`);
      }
    } catch (ex) {
      log.info(`Couldn't log the user event for an order!`);
    }

    try {
      // this is a dry run that populates the charge with the amount we would like to charge the user
      charge = yield this.charge(order, user, Object.assign({dry: true}, opts));

      // this is the real one and if successful will override the last value with a real charge, 
      // otherwise the previous assignment sticks.
      charge = yield this.charge(order, user, opts);

      if(data.amount > 0) {
        let addendum = user.getCredit();
        if(opts.nocredit) {
          addendum += " (credit not used)";
        }
        yield notify.notifyAdmins(`:moneybag: ${ _user.name() } charged ${ user.link() } $${ (data.amount / 100).toFixed(2) } for ${ data.description }. ${ addendum }`, [ 'slack' ], { channel : '#rental-alerts' });
      } else if(data.amount < 0) {
        yield notify.notifyAdmins(`:money_with_wings: ${ _user.name() } *credited* ${ user.link() } $${ (-data.amount / 100).toFixed(2) } for ${ data.description }. ${ user.getCredit() }`, [ 'slack' ], { channel : '#rental-alerts' });
      } else {
        charge.amount = charge.amount || 0;
        charge = `$${ charge.amount / 100 }`;
        let phrase = ( _user.name() === user.name()) ? `cleared their outstanding ${charge} balance`  : `cleared the outstanding ${charge} balance of ${ user.name() }`;
        yield notify.notifyAdmins(`:scales: ${ _user.name() } ${ phrase } | ${ apiConfig.uri }/users/${ user.id }`, [ 'slack' ], { channel : '#rental-alerts' });
      }

      // looking over the template at templates/email/miscellaneous-charge/html.hbs and
      // modules/shop/lib/order-service.js it looks like we need to pass an object with
      // quantity, price, and description defined.
      yield this.notifyOfCharge(Object.assign(opts, {
        quantity: 1,
        price: data.amount,
        description: data.description,
        chargeName: data.description,
      }), user);

    } catch (err) {
      yield this.failedCharge(data.amount || charge.amount, user, err);
      yield this.suspendIfMultipleFailed(user);

      throw {
        status  : 400,
        code    : `SHOP_PAYMENT_FAILED`,
        message : `The card was declined.`,
        data    : user
      };
    }

    return {order: order, user: user};
  }

  static *topUp(data, _user) {
    let user = yield User.findById(data.userId);
    if(yield this.quickCharge(data, _user, {
      subject: "You just topped up $20 for future rides with Waive",
      nocredit: true, 
      overrideAdminCheck: true, 
      isTopUp: true
    })) {
      yield user.update({credit: user.credit + 20 * 100});
    }
  }

  static *refund(payload, paymentId, _user) {
    let order = yield Order.findById(paymentId);
    let hasBooking = yield BookingPayment.findOne({ where: { orderId: order.id } }); 
    if(!payload) {
      payload = {amount: order.amount};
    }
    let charge = {amount: payload.amount};
    let user = yield this.getUser(order.userId);
    let response;

    try {
      response = yield stripe.charges.refund(order.chargeId, payload.amount);
    } catch(err) {
      throw {
        status: 400,
        code: err.code,
        message: err.message,
        data: user,
      };
    }
    yield order.update({
      refunded: payload.amount,
      status: 'refunded',
    });

    if (order.description === 'Top up $20') {
      yield user.update({credit: user.credit - 2000});
    }

    let email = new Email();
    let amount = (payload.amount / 100).toFixed(2);
    let orderDate = moment(order.createdAt).format('MMMM Do YYYY'); 

    yield notify.notifyAdmins(`:carousel_horse: ${ _user.link() } refunded $${ amount } to ${ user.link() } which was for ${ order.description }`, [ 'slack' ], { channel : '#rental-alerts' });

    try {
      yield email.send({
        to       : user.email,
        from     : emailConfig.sender,
        subject  : `$${ amount } refunded ${hasBooking ? `for your trip on ${ orderDate }` : `by Waive ${order.description ? `for ${order.description.toLowerCase()}` : ''}`}`,
        template : 'refund',
        context  : {
          name       : user.name(),
          amount     : amount,
          description: order.description.toLowerCase(), 
          date       : orderDate,
        }
      });
    } catch(err) {
      log.warn(err);
    };
    return {
      status: response.status, 
      payload, 
      user, 
      paymentId,
    };
  }

  static *create(payload, _user) {
    let data  = yield hooks.call('shop:store:order:before', payload, _user);
    let user  = yield this.getUser(data.userId);

    this.hasAccess(user, _user);
    this.verifyCurrency(data.currency);

    // ### Create Order
    let miscCharge = null;
    let cart  = yield CartService.getCart(data.cart);
    let items = yield CartService.getItems(cart);
    let amountInCents = items.reduce((prev, next) => {
      return prev + next.total;
    }, 0);
    let order = new Order({
      createdBy   : _user.id,
      userId      : data.userId,
      source      : data.source,
      description : data.description,
      metadata    : data.metadata,
      currency    : data.currency,
      amount      : amountInCents
    });
    yield order.save();
    for (let item of items) {
      let description = item.quantity > 1 ? `${item.name} x ${item.quantity}` : item.name;
      let currentItem = new Order({
        createdBy   : _user.id,
        userId      : data.userId,
        source      : data.source,
        description,
        metadata    : data.metadata,
        currency    : data.currency,
        amount      : (item. price * item.quantity),
      });
      yield currentItem.save();
      let bookingPayment = new BookingPayment({
        bookingId: payload.bookingId,
        orderId: currentItem.id,
      });
      yield bookingPayment.save();
      // A miscellaneous charge is likely an issue we should keep track of
      yield UserLog.addUserEvent(user, 'FEE', bookingPayment.id, description);
    }

    // ### Add Items

    yield this.addItems(order, items);
    // Notify user if they received a miscellaneous charge
    if (items) {
      log.info(`Notifying user of miscellaneous charge: ${ user.id }`);
      let currentBooking = yield Booking.find({
        where: { id: payload.bookingId }, 
        include: [
          {
            model: 'Car',
            as: 'car',
          }
        ]
      });
      yield this.notifyOfCharge(items, user, {
        subject: `Charges for your booking in ${currentBooking[0].car.license} on ${moment(currentBooking[0].createdAt).format('MMMM Do, YYYY')}`,
        leadin: `Here's your receipt for any additional charges from your booking on ${moment(currentBooking[0].createdAt).format('MMMM Do, YYYY')} with ${currentBooking[0].car.license}:`
      });
    }

    try {
      yield this.charge(order, user);
      yield notify.notifyAdmins(`:moneybag: ${ _user.name() } charged ${ user.link() } $${ amountInCents / 100 } for ${ data.description } | ${ apiConfig.uri }/bookings/${ data.bookingId }`, [ 'slack' ], { channel : '#rental-alerts' });

      yield hooks.call('shop:store:order:after', order, payload, _user);
    } catch (err) {
      yield this.failedCharge(amountInCents, user, err);
      throw error.parse({
        code    : `SHOP_PAYMENT_FAILED`,
        message : `The card was declined.`
      }, 400);
    }
    yield order.delete();
    return order;
  }

  static *getCarNow(booking, user, amount) {
    let card = yield user.getCard();
    let car = yield Car.findOne({ where: { id: booking.carId } });

    let order = new Order({
      createdBy : user.id,
      userId    : user.id,
      source      : card.id,
      description : `${car.license} rebook`,
      metadata    : null,
      currency    : 'usd',
      amount      : amount
    });
    let fee = (amount/100).toFixed(2);

    yield order.save();
    try {         
      yield this.charge(order, user, {nodebt: true});
      yield notify.notifyAdmins(`:heavy_dollar_sign: Charged the impatient ${ user.link() } $${ fee } to rebook ${ car.license }. ${ user.getCredit() }`, [ 'slack' ], { channel : '#rental-alerts' });
    } catch (err) {
      yield this.failedCharge(amount, user, err, ` ${booking.link()} `);
      return;
    }

    return order;
  }

  static *extendReservation(booking, user, amount, time) {
    amount = amount || 100;
    time = time || 10;

    let card = yield user.getCard();

    let order = new Order({
      createdBy   : user.id,
      userId      : user.id,
      source      : card.id,
      description : `Booking ${booking.id} ${time}min reservation extension`,
      metadata    : null,
      currency    : 'usd',
      amount      : amount
    });

    yield order.save();
    try {
      yield this.charge(order, user, {nodebt: true});
      yield notify.notifyAdmins(`:moneybag: Charged ${ user.link() } $${ (amount / 100).toFixed(2) } on ${ booking.link() } ${ time }min extension. ${ user.getCredit() }`, [ 'slack' ], { channel : '#rental-alerts' });
    } catch (err) {
      yield this.failedCharge(amount, user, err, ` | ${ booking.link() }`);
      return false;
    }

    // Regardless of whether we successfully charged the user or not, we need
    // to associate this booking with the users' order id
    let payment = new BookingPayment({
      bookingId : booking.id,
      orderId   : order.id
    });
    yield payment.save();
    return true;
  }

  // The regular over-time booking charge code.
  static *createTimeOrder(booking, user) {
    // This is to avoid a double-booking charge - see #674.
    if (! (yield RedisService.shouldProcess('booking-charge', booking.id))) {
      yield notify.notifyAdmins(`Avoiding a potential double charging of booking ${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
      return true;
    }

    // Don't charge the waivework users or admins for going over 2 hours.
    if(user.isWaivework || user.isAdmin()) {
      return true;
    }

    let isLevel = yield user.isTagged('level');
    let freeTime = booking.getFreeTime(isLevel);

    // Determine time
    let amount = 0;
    let minutesOver = 0;
    let billableGroups = 0;

    let start = yield this.getDetails('start', booking.id);
    let end = yield this.getDetails('end', booking.id);
    let description;

    if (start && end) {

      let diff = moment(end.createdAt).diff(start.createdAt, 'minutes');
      if (diff > freeTime) {
        minutesOver = Math.max(diff - freeTime, 0);
      }
    }

    if (minutesOver !== 0 || booking.isFlagged('rush')) {
      billableGroups = Math.ceil(minutesOver / 10);
      if(!booking.isFlagged('rush')) {
        amount = Math.round((billableGroups / 6 * 5.99) * 100);
        description = `${ minutesOver }min more booking ${ booking.id }`;
      } else {
        amount = 1499;

        // waiverush is LA exclusive for now (2018-11-08)
        let startHour = +moment(start.createdAt).tz('America/Los_Angeles').format('H');

        // We need to find out whether we are considering 10AM today or tomorrow
        let dayToCompute = moment(start.createdAt);
        if(startHour > 12) {
          // This means it's 10AM tomorrow.
          dayToCompute = dayToCompute.add('1','day');
        }

        let tenAM = dayToCompute.tz('America/Los_Angeles').format('YYYY-MM-DD 10:00');
        minutesOver = Math.ceil(Math.max( (new Date() - moment.tz(tenAM, 'America/Los_Angeles')) / 1000 / 60, 0));
        billableGroups = Math.ceil(minutesOver / 10);
        amount += Math.round((billableGroups / 6 * 5.99) * 100);

        description = [
          'WaiveRush flat rate ',
          billableGroups ? `+ ${ minutesOver }min over ` : '',
          `booking ${ booking.id }`
        ].join('');
      }

      let card = yield user.getCard();
      let cart = yield CartService.createTimeCart(minutesOver, amount, user);
      let order = new Order({
        createdBy : user.id,
        userId    : user.id,

        // User card id
        source      : card.id,
        description : description,
        metadata    : null,
        currency    : 'usd',
        amount      : amount
      });

      yield order.save();
      yield this.addItems(order, cart.items);

      try {
        yield this.charge(order, user);
        yield notify.notifyAdmins(`:moneybag: Charged ${ user.link() } $${ (amount / 100).toFixed(2) } for ${ description }. ${ user.getCredit() }`, [ 'slack' ], { channel : '#rental-alerts' });
        if(!booking.isFlagged('rush')) {
          log.info(`Charged user for time driven : $${ amount / 100 } : booking ${ booking.id }`);
        }
      } catch (err) {
        yield this.failedCharge(amount, user, err, ` | ${ booking.link() }`);
      }

      // Regardless of whether we successfully charged the user or not, we need
      // to associate this booking with the users' order id
      let payment = new BookingPayment({
        bookingId : booking.id,
        orderId   : order.id
      });
      yield payment.save();
    }
    
    // This gets the city of the booking off of the address of the current booking
    let details = yield BookingDetails.find({
      where: {
        booking_id: booking.id
      }
    });
    let validAddress = details[0].address !== null ? details[0].address : details[1].address;

    let city = '';
    try {
      city = ` in ${validAddress.split(',').slice(this.length - 3, this.length - 2)[0].trim()}`;
    } catch (err) {
      log.warn(err);
    }

    // This gets which WaiveCar was used for the booking
    let car = yield Car.findById(booking.carId);
    let carName = car.license;

    let allCharges = yield this.getTotalCharges(booking);
    let totalAmount = allCharges.totalCredit + allCharges.totalPaid;

    let fullAuthorization = false;
    let authCharges = 0;
    // This creates a list of charges to be injected into the template
    let chargesList = allCharges.payments.map(charge => {
      let description = charge.shopOrder.description.replace(/Booking\s\d*/i, '');
      if (description.includes('authorization')) {
        authCharges += charge.shopOrder.amount;
      }
      if (charge.shopOrder.amount === 2000) {
        fullAuthorization = true;
      }
      return (
        `<tr>
          <td>
            ${description}
          </td>
          <td class="right-item">
            $${(Math.abs(charge.shopOrder.amount / 100)).toFixed(2)}
          </td>
        <tr>`
      )
    }).join('').trim();
    let dollarAmount = (totalAmount / 100).toFixed(2);
    let email = new Email();
    // This creates a list of charges to be injected into the template
    let optionalText = fullAuthorization ? ( 
      `<p>
        A temporaray $20 hold has been made on your card and is now released. This is done each time 
        you use Waive for your first ride in every 2 days. If you would like to reduce the amount 
        of this hold to $1, you can visit our website and add a $20 credit to your account from your 
        profile.
      </p>`
    ) : (
      `<p>
         A $1 hold has been made on your card and is now released. This is done each time you use 
         Waive for your first ride in every 2 days.    
      </p>`
      );
    if (totalAmount > 0) {
      // This is sent out if there are charges for the booking or if the user is receiving a $20 hold 
      try {
        yield email.send({
          to       : user.email,
          from     : emailConfig.sender,
          subject  : `$${ dollarAmount } receipt for your recent booking with ${carName}${ city }`,
          template : 'time-charge',
          context  : {
            name     : user.name(),
            car      : carName, 
            duration : minutesOver,
            paid     : allCharges.totalPaid ? (allCharges.totalPaid / 100).toFixed(2) : false,
            credit   : allCharges.totalCredit ? (allCharges.totalCredit / 100).toFixed(2) : false,
            creditLeft: (user.credit / 100).toFixed(2),
            list     : chargesList,
            optionalText: authCharges > 0 ? optionalText : null 
          }
        });
      } catch(err) {
        log.warn('Failed to deliver time notification email: ', err);
      } 
    } else {
      // This is sent out if there are no charges for the booking
      try {
        yield email.send({
            to       : user.email,
            from     : emailConfig.sender,
            subject  : `You drove for free${ city }. Thanks for using Waive.`,
            template : 'free-ride-complete',
            context  : {
              name     : user.name(),
              car      : carName, 
              duration : minutesOver,
              city     : city,
              optionalText: authCharges > 0 ? optionalText : null
            }
        });
      } catch(err) {
        log.warn('Failed to deliver time notification email: ', err);
      } 
    }
  }

  static *getTotalCharges(booking) {
    // Fetches all payments for a booking and returns the total charges for a trip
    let payments = yield BookingPayment.find({
      where: { booking_id: booking.id },
      include: [
        {
          model: 'Shop/Order',
          as: 'shopOrder'
        }
      ]
    });

    let totalCredit = 0;
    let totalPaid = 0;
    let types = [];
    if (payments.length) {
      totalCredit = payments.filter((row) => row.shopOrder.chargeId === '0' ).reduce((total, payment) => total + payment.shopOrder.amount, 0);
      let filteredPayments = payments.filter((row) => row.shopOrder.description !== 'Pre booking authorization - refunded');
      totalPaid = filteredPayments.filter((row) => row.shopOrder.chargeId !== '0').reduce((total, payment) => total + payment.shopOrder.amount, 0);
      types = payments.map(payment => payment.shopOrder.description.replace(/Booking\s\d*/i, ''));
    }

    return {
      totalCredit,
      totalPaid,
      types,
      payments,
    };
  }

  static *authorize(payload, _user) {
    payload = payload || {};
    // this is created for when there will be no charge on the account
    var order = {
      amount: 0,
    };
    let card = yield _user.getCard();
    let amount = _user.credit > 0 ? 100 : 2000;
    // This data leak is so that if we fail to charge the card, we can
    // find the card and amount we tried to charge.
    this.authorize.last = {
      card: card,
      amount: amount
    };
    let now = moment().utc();
    if(payload.bypass) {
      yield notify.notifyAdmins(`:rabbit2: ${ _user.link() } is bypassing authorization check`, [ 'slack' ], { channel : '#rental-alerts' });
    } else if ( _user.lastHoldAt === null || (_user.lastHoldAt && now.diff(_user.lastHoldAt, 'days') > 2)) {
      if (!card) {
        throw error.parse({
          code    : 'SHOP_MISSING_CARD',
          message : 'The user does not have a valid payment method.'
        });
      }
      // ### Create Order
      order = new Order({
        createdBy   : _user.id,
        userId      : _user.id,
        source      : card.id,
        description : 'Pre booking authorization - refunded',
        currency    : 'usd',
        amount      : amount
      });
      yield order.save();
      console.log('order-save');

      let charge = yield this.charge(order, _user, {nocapture: true});
      console.log('charge-made');
      if (charge.status !== 'failed') {
        this.authorize.last.newAuthorization = true;
        yield _user.update({ lastHoldAt: now });
      }
      yield this.cancel(order, _user, charge);
    } 
    // notify that there was no hold for the ride
    return order;
  }

  static *captures(id, payload, _user) {
    let order = yield this.getOrder(id);
    let user  = yield this.getUser(order.userId);

    this.hasAccess(user, _user);

    // ### Start Capture

    let data  = yield hooks.call('shop:store:capture:before', order, payload, _user);
    let cart  = yield CartService.getCart(payload.cart);
    let items = yield CartService.getItems(cart);

    // ### Verify Total
    // Calculate total and verify that the total calculated is larger than the
    // value of the provided cart.

    let total = items.reduce((prev, next) => {
      return prev + next.total;
    }, 0);

    if (order.amount < total) {
      throw error.parse({
        code    : `SHOP_INSUFFICIENT_FUNDS`,
        message : `The cart provided has a higher value than the authorized amount.`
      }, 400);
    }

    // ### Update Order

    yield order.update({
      amount : total
    });

    // ### Add Items

    for (let i = 0, len = items.length; i < len; i++) {
      let item = new OrderItem({
        orderId     : order.id,
        itemId      : items[i].id,
        productNo   : items[i].productNo,
        name        : items[i].name,
        description : items[i].description,
        price       : items[i].price,
        quantity    : items[i].quantity
      });
      yield item.save();
    }

    // ### Charge

    yield this.capture(order);
    yield hooks.call('shop:store:authorize:after', order, data, _user);

    return order;
  }

  // ### READ

  /**
   * Returns an indexed array of orders.
   * @param  {Object} query
   * @param  {Object} _user
   * @return {Array}
   */
  static *index(query, _user) {
    let statusType = query.status.match(/,/) ? 
      queryParser.IN : queryParser.STRING;

    let dbQuery = queryParser(query, {
      where : {
        userId   : queryParser.NUMBER,
        status   : statusType,
        source   : queryParser.STRING,
        chargeId : queryParser.STRING,
        amount   : queryParser.BETWEEN,
        refunded : queryParser.BETWEEN
      }
    });

    // ### Admin Query
    if (query.order) {
      dbQuery.order = [ query.order.split(',') ];
    }
    dbQuery.limit = +query.limit || 20;
    dbQuery.offset = +query.offset || 0;

    if (_user.hasAccess('admin')) {
      return yield Order.find(dbQuery);
    }

    // ### User Query

    dbQuery.where.userId = _user.id;
    return yield Order.find(dbQuery);
  }

  /**
   * Returns a full order view with the provided id.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *show(id, _user) {
    let order = yield this.getOrder(id);
    let user  = yield this.getUser(order.userId);

    this.hasAccess(user, _user);

    order.items = yield OrderItem.find({
      where : {
        orderId : order.id
      }
    });

    return order;
  }

  // ### HELPERS

  /**
   * Retrieves details for a booking.
   * @param  {String} type
   * @param  {Number} id
   * @return {Object}
   */
  static *getDetails(type, id) {
    return yield BookingDetails.findOne({
      where : {
        bookingId : id,
        type      : type
      }
    });
  }

  // order is the core object here. It effectively gets passed
  // through to stripe as-is in shop/lib/stripe/charges.js
  static *charge(order, user, opts) {
    let start = new Date();
    function t(what){ 
      console.log(" ", new Date() - start, what);
    }
    // See #650: Api: Pass through the credit column before charging a user 
    //
    // We do two things here at once:
    //
    //  If a user has an existing debt, expressed as a negative credit, we
    //  tack that on to what we are attempting to charge.
    //
    //  If a user has an existing credit, expressed as a positive credit, we
    //  subtract that from what we are attempting to charge.
    //
    // There's an important nuance here in that we need to settle the books
    // after things are done - I mean this is basic bookkeeping but yeah,
    // might be new to you. :-)
    //

    opts = opts || {};

    //
    // We need to make sure that we have up to date information on this user.
    //
    // In the implementation of the car charge reward program (#1306), the
    // user was credited in the database but the model of the user wasn't
    // updated to reflect this credit. This means that users could get fully
    // charged when trying things for the first time.  Instead of fixing
    // things there and trying to make sure we aren't passing in stale models
    // we really should be fixing them here and make sure that we don't have 
    // stale information about the user so we pull it again.
    //
    user = yield User.findById(user.id);

    // Normally we try to capture the payment (as in, we actually charge
    // the user). We can do this two-step thing where we just see if the
    // CC is valid by specifying an opt
    let capture = true;
    let credit = user.credit;
    let charge = {};
    let silentFailure = false;

    if(opts.nocapture) {
      capture = false;
      // We don't try to balance the books
      // when we aren't capturing.
      credit = 0;
    }
    if(opts.nocredit) {
      credit = 0;
    }

    // If the user doesn't have enough credit to cover the entire costs, we
    // proceed to attempt to charge things.
    //
    // We also use this routine to credit the users account so the bottom
    // condition has to be in there.
    let amountToCharge = order.amount - credit;
    charge.amount = amountToCharge;
    if(opts.dry) {
      return charge;
    }
    console.log(order, credit, charge);

    if (order.amount >= 0 && credit < order.amount) {
      try {
        let service = this.getService(config.service, 'charges');
        t("charges-get");

        // Since debt is negative credit we need to subtract to add
        // to the amount being charged. Yes that's confusing, read it
        // again if you need to.
        //
        // For example, if the user has a balance of -$2 and the fee is $4
        // Then 4 - -2 = 4 + 2 = 6 ... we charge them $6.
        //
        // If the user has a credit of $2 and the fee is $4 
        // Then 4 - 2 = 2 ... we charge them $2.

        // Stripe will sensibly tell us to jump in a lake if the amount to
        // charge is under a dollar. If this is the case we don't bother.
        // See https://github.com/WaiveCar/Waivecar/issues/852 for documentation
        //
        if(amountToCharge < 100) {
          silentFailure = true;
          throw new Error;
        } else {
          charge = yield service.create({
            source      : order.source,
            description : order.description,
            metadata    : order.metadata ? JSON.parse(order.metadata) : {},
            currency    : order.currency,
            amount      : amountToCharge,
            capture     : capture
          }, user);
          t("charges-create");

          charge.amount = amountToCharge;

          yield order.update({
            service  : config.service,
            chargeId : charge.id,
            status   : capture ? 'paid' : 'authorized'
          });
          t("order-update");
        }
      } catch (ex) {
        // This more or less says we were unable to charge the user.
        // If we are capturing, as in, we expected to charge them,
        // this is a splendid time to modify their credit with us.
        if (capture) {
          // We failed to charge order.amount so that's what our math is.
          // It's not more complex than that.
          
          // If we failed to charge someone, sometimes they were attempting
          // to buy something, in which case, we don't give it to them and
          // don't charge them.
          if(!(opts.nodebt || opts.nocredit)) {
            yield user.update({ credit: user.credit - order.amount });
          }

          // A failed charge needs to be marked as such (see #670).
          yield order.update({ status: 'failed' });

          if(!silentFailure) {
            // We need to hold this failed charge against the user. (see #715)
            yield UserLog.addUserEvent(user, 'DECLINED', order.id);

            // And finally we tell them (also covered in #670).
            yield notify.sendTextMessage(user, 'Hi. Unfortunately we were unable to charge your credit card for your last ride. Please call us to help resolve this issue');
          }
        }
        yield user.save();

        if(!silentFailure) {
          // We need to pass up this error because it's being handled
          // above us.
          throw ex;
        }

        // This is here in case someone is sloppy and removes the 
        // above line in the future, leading to a very tricky and
        // hard to catch fall-through bug.
        return charge;
      }

      // If we got here then we've successfully changed the user 
      // some amount. You can look over the math as many times as
      // you want, but arriving here means their credit will be 0.
      if (capture) {
        // This is the amount that we actually charged.
        yield order.update({ amount: order.amount - credit });

        if(!opts.nocredit) {
          yield user.update({ credit: 0 });
        }
      }
    } else {
      // If the user can cover the entirety of the charge with the
      // credit they have then we can just lob off the charge from
      // their existing credit.
      //
      // Technically this capture check isn't needed here given the 
      // parent logic, but excluding this would incur a fragile 
      // dependency on the parent logic not changing - so we keep it.
      if (capture) {
        if(!opts.nocredit) {
          yield user.update({ credit: credit - order.amount });
        }

        // We now "fake" as if we did a CC charge to keep the
        // rest of the code from being confused by this.
        yield order.update({
          service  : config.service,
          chargeId : 0,
          status   : 'paid'
        });
      }
    }

    return charge;
  }

  static *cancel(order, user, charge) {
    let service = this.getService(config.service, 'charges');
    yield service.refund(charge.id);
    yield order.update({
      status : 'cancelled'
    });
  }

  static *capture(order) {
    let service = this.getService(config.service, 'charges');
    let charge  = yield service.capture(order.chargeId, {
      amount : order.amount
    });
    yield order.update({
      status   : 'paid',
      amount   : charge.amount,
      refunded : charge.amount_refunded
    });
  }

  static *addItems(order, items) {
    for (let i = 0, len = items.length; i < len; i++) {
      let item = new OrderItem({
        orderId     : order.id,
        itemId      : items[i].id,
        productNo   : items[i].productNo,
        name        : items[i].name,
        description : items[i].description,
        price       : items[i].price,
        quantity    : items[i].quantity
      });
      yield item.save();
    }
  }

  static verifyCurrency(currency) {
    if (config.currencies.indexOf(currency) === -1) {
      throw error.parse({
        code    : `SHOP_INVALID_CURRENCY`,
        message : `The requested currency is not supported.`
      }, 400);
    }
  }

  static *suspendIfMultipleFailed(user) {
    let failedChargeList = yield Order.find({
      // This looks for distinct cards
      group: ['source'],
      where: {
        // which had a failed charge
        status: 'failed',
        userId: user.id,
        // in the past hour
        created_at: {
          $gte: new Date(new Date() - (3600 * 1000 * 10))
        }
      }
    });

    if(failedChargeList.length > 1 && user.status === 'active') {
      yield UserService.suspend(user, 'Potential credit card fraud'); 
    }
  }

  static *failedCharge(amountInCents, user, err, extra) {
    log.warn(`Failed to charge user: ${ user.id }`, err);
    let amountInDollars = (amountInCents / 100).toFixed(2);
    extra = extra || '';
    yield notify.notifyAdmins(`:lemon: Failed to charge ${ user.link() } $${ amountInDollars }`, [ 'slack' ], { channel : '#rental-alerts' });

    // We need to communicate that there was a potential charge + a potential 
    // balance that was attempted to be cleared.  This email can cover all 3
    // conditions. We can detect it pretty easily.
    //
    // This is how much credit the user had prior to this charge.
    let creditBeforeCharge = user.credit + amountInCents;
    let messageParts = [];
    let message = '';

    // If the user had $0 in credit before the charge, then this email
    // is about 1 failed charge.
    if(amountInCents) {
      messageParts.push('cover the $' + amountInDollars + ' in fees disclosed in the previous email');
    }
    if(creditBeforeCharge) {
      messageParts.push(`clear your existing balance of $${ (Math.abs(creditBeforeCharge) / 100).toFixed(2) } with us`);
    }
    
    // if there's two parts we show a grand total, otherwise we omit it
    // because it looks redundant.
    if(messageParts.length > 1){
      message = '$' + (-user.credit / 100).toFixed(2) + ' to ';
    } else {
      message = 'to ';
    }
    message += messageParts.join(' and ');

    let email = new Email();
    try {
      yield email.send({
        to       : user.email,
        from     : emailConfig.sender,
        subject  : 'Important! Failed Charge.',
        template : 'failed-charge',
        context  : {
          name   : user.name(),
          charge : amountInDollars,
          message: message
        }
      });
    } catch (err) {
      log.warn('Failed to deliver notification email: ', err);
    }
  }

  // Notify user that miscellaneous was added to their booking
  static *notifyOfCharge(item, user, opts={}) {
    if(item.price === 0) {
      return;
    }
    let email = new Email();
    let word = false;
    try {
      if(!Array.isArray(item)) {
        item = [item];
      }
      item.totalNum = item.map((row) => row.quantity * row.price).reduce((a,b) => a + b);
      item.total = (Math.abs(item.totalNum / 100)).toFixed(2);
      let chargeList = item.map(charge => 
        `<tr>
          <td>
            ${charge.name ? charge.name : (item[0].chargeName ? item[0].chargeName : 'Miscellaneous Charge')}
          </td>
          <td class="right-item">
            ${charge.quantity}
          </td>
          <td class="right-item">
            $${(Math.abs(charge.price / 100)).toFixed(2)}
          </td>
          <td class="right-item">
            $${charge.total ? (Math.abs(charge.total / 100)).toFixed(2) : (charge.price / 100).toFixed(2)}
          </td>
        <tr>` ).join('');
      word = item.totalNum > 0 ? 'Charges' : 'credit';
      if (word === 'Charges' && !opts.isTopUp) {
        opts.subject = opts.subject || `$${ item.total } charged to your account`;
        opts.leadin = opts.leadin || 'Here is your receipt for charges added to your account:';
        yield email.send({
          to       : user.email,
          from     : emailConfig.sender,
          subject  : opts.subject,
          template : 'miscellaneous-charge',
          context  : {
            leadin   : opts.leadin,
            name   : user.name(),
            word   : word,
            charge : item,
            chargeList,
          }
        });
      } else {
        yield email.send({
          to: user.email,
          from: emailConfig.sender,
          subject  : opts.subject || `You just got $${item.total} for future rides with Waive`,
          template : 'miscellaneous-credit',
          context  : {
            name   : user.name(),
            description: opts.description || item[0].description,
            charge : item,
          }
        });
      }
    } catch (err) {
      log.warn(`Failed to deliver ${word} notification email: `, err);
    }
  }

};
