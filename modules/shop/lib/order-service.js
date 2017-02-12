'use strict';

let co          = require('co');
let Service     = require('./classes/service');
let CartService = require('./cart-service');
let moment      = require('moment');
let _           = require('lodash');
let Email       = Bento.provider('email');
let queryParser = Bento.provider('sequelize/helpers').query;
let User        = Bento.model('User');
let Cart        = Bento.model('Shop/Cart');
let Card        = Bento.model('Shop/Card');
let Order       = Bento.model('Shop/Order');
let OrderItem   = Bento.model('Shop/OrderItem');
let BookingDetails = Bento.model('BookingDetails');
let BookingPayment = Bento.model('BookingPayment');
let RedisService   = require('../../waivecar/lib/redis-service');
let notify      = Bento.module('waivecar/lib/notification-service');
let hooks       = Bento.Hooks;
let redis       = Bento.Redis;
let error       = Bento.Error;
let config      = Bento.config.shop;
let emailConfig = Bento.config.email;
let log         = Bento.Log;
let apiConfig   = Bento.config.api;

module.exports = class OrderService extends Service {

  // Apparently you can't just charge a user without filling up a fucking
  // "cart" first. That's asinine bullshit and absolutely ridiculous. So
  // we are subverting that by copying the code below (see *create) and
  // removing all the overlapping dependency anti-patterned nonsense.
  // I mean god damn...
  static *quickCharge(data, _user) {
    let user = yield this.getUser(data.userId);
    data.currency = data.currency || 'usd';
    this.verifyCurrency(data.currency);

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
      yield this.charge(order, user);

      log.info(`Notifying user of miscellaneous charge: ${ user.id }`);
      // looking over the template at templates/email/miscellaneous-charge/html.hbs and
      // modules/shop/lib/order-service.js it looks like we need to pass an object with
      // quantity, price, and description defined.
      this.notifyOfCharge({
        quantity: 1,
        price: data.amount,
        description: data.description
      }, user);

    } catch (err) {
      log.warn(`Failed to charge user: ${ user.id }`, err);
      throw error.parse({
        code    : `SHOP_PAYMENT_FAILED`,
        message : `The user's card was declined.`
      }, 400);
    }

    return {order: order, user: user};
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
    let order = new Order({
      createdBy   : _user.id,
      userId      : data.userId,
      source      : data.source,
      description : data.description,
      metadata    : data.metadata,
      currency    : data.currency,
      amount      : items.reduce((prev, next) => {
        return prev + next.total;
      }, 0)
    });
    yield order.save();

    // ### Add Items

    yield this.addItems(order, items);
    miscCharge = _.find(items, { name : 'Miscellaneous' });

    // ### Charge

    try {
      yield this.charge(order, user);

      // Notify user if they received a miscellaneous charge
      if (miscCharge) {
        log.info(`Notifying user of miscellaneous charge: ${ user.id }`);
        this.notifyOfCharge(miscCharge, user);
      }

      yield hooks.call('shop:store:order:after', order, payload, _user);
    } catch (err) {
      log.warn(`Failed to charge user: ${ user.id }`, err);
      throw error.parse({
        code    : `SHOP_PAYMENT_FAILED`,
        message : `The user's card was declined.`
      }, 400);
    }

    return order;
  }

  /**
   * Special case order automatically created based on booking time
   * @param {Object} booking
   * @param {Object} user
   */
  static *createTimeOrder(booking, user) {
    // This is to avoid a double-booking charge - see #674.
    if (! (yield RedisService.shouldProcess('booking-charge', booking.id))) {
      yield notify.notifyAdmins(`Avoiding a potential double charging of booking ${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
      return true;
    }

    // Determine time
    let amount = 0;
    let minutesOver = 0;
    let billableGroups = 0;

    let start = yield this.getDetails('start', booking.id);
    let end = yield this.getDetails('end', booking.id);

    if (start && end) {

      // Get difference
      let diff = moment(end.createdAt).diff(start.createdAt, 'minutes');
      if (diff > 120) {
        minutesOver = Math.max(diff - 120, 0);
      }
    }

    if (minutesOver === 0) return;
    billableGroups = Math.ceil(minutesOver / 10);
    amount = Math.round((billableGroups / 6 * 5.99) * 100);

    let card = yield Card.findOne({ where : { userId : user.id } });
    let cart = yield CartService.createTimeCart(minutesOver, amount, user);
    let order = new Order({
      createdBy : user.id,
      userId    : user.id,

      // User card id
      source      : card.id,
      description : 'Payment for additional time for waivecar rental',
      metadata    : null,
      currency    : 'usd',
      amount      : amount
    });

    yield order.save();
    yield this.addItems(order, cart.items);

    try {
      yield this.charge(order, user);
      let payment = new BookingPayment({
        bookingId : booking.id,
        orderId   : order.id
      });
      yield payment.save();

      yield notify.notifyAdmins(`:moneybag: Charged ${ user.name() } $${ amount / 100 } for ${ minutesOver } minutes | ${ apiConfig.uri }/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
      log.info(`Charged user for time driven : $${ amount / 100 } : booking ${ booking.id }`);
    } catch (err) {
      log.warn(`Failed to charge user for time: ${ user.id }`, err);

      yield notify.notifyAdmins(`:earth_africa: *Failed to charge* ${ user.name() } for time driven: ${ err } | ${ apiConfig.uri }/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
    }

    let email = new Email();
    try {
      yield email.send({
        to       : user.email,
        from     : emailConfig.sender,
        subject  : 'Waivecar [Charge Added For Time]',
        template : 'time-charge',
        context  : {
          name     : user.name(),
          duration : minutesOver,
          amount   : (amount / 100).toFixed(2)
        }
      });
    } catch (err) {
      log.warn('Failed to deliver time notification email: ', err);
    }
  }

  /**
   * Creates a authorized order of a given amount to be captured later.
   * @param  {Object} payload
   * @param  {Object} _user
   * @return {Object}
   */
  static *authorize(payload, _user) {
    let card = yield Card.findOne({ where : { userId : _user.id } });

    if (!card) {
      throw error.parse({
        code    : 'SHOP_MISSING_CARD',
        message : 'The user does not have a valid payment method.'
      });
    }

    // ### Create Order
    let order = new Order({
      createdBy   : _user.id,
      userId      : _user.id,
      source      : card.id,
      description : 'Pre booking authorization',
      currency    : 'usd',
      amount      : 100
    });
    yield order.save();

    // ### Charge

    let charge = yield this.charge(order, _user, {nocapture: true});
    yield this.cancel(order, _user, charge);

    return order;
  }

  /**
   * Captures an authorized payment with the submitted cart.
   * @param  {Number} id
   * @param  {Object} payload
   * @param  {Object} _user
   * @return {Object}
   */
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
    query = queryParser(query, {
      where : {
        userId   : queryParser.NUMBER,
        status   : queryParser.STRING,
        source   : queryParser.STRING,
        chargeId : queryParser.STRING,
        amount   : queryParser.BETWEEN,
        refunded : queryParser.BETWEEN
      }
    });

    // ### Admin Query

    if (_user.role === 'admin') {
      return yield Order.find(query);
    }

    // ### User Query

    query.where.userId = _user.id;
    return yield Order.find(query);
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

    // Normally we try to capture the payment (as in, we actually charge
    // the user). We can do this two-step thing where we just see if the
    // CC is valid by specifying an opt
    let capture = true;
    let credit = user.credit;
    let charge = {};

    if(opts.nocapture) {
      capture = false;
      // We don't try to balance the books
      // when we aren't capturing.
      credit = 0;
    }

    // If the user doesn't have enough credit to cover the entire costs, we
    // proceed to attempt to charge things.
    //
    // We also use this routine to credit the users account so the bottom
    // condition has to be in there.
    if (order.amount >= 0 && credit < order.amount) {
      try {
        let service = this.getService(config.service, 'charges');
        charge  = yield service.create({
          source      : order.source,
          description : order.description,
          metadata    : order.metadata ? JSON.parse(order.metadata) : {},
          currency    : order.currency,

          // Since debt is negative credit we need to subtract to add
          // to the amount being charged. Yes that's confusing, read it
          // again if you need to.
          //
          // For example, if the user has a balance of -$2 and the fee is $4
          // Then 4 - -2 = 4 + 2 = 6 ... we charge them $6.
          //
          // If the user has a credit of $2 and the fee is $4 
          // Then 4 - 2 = 2 ... we charge them $2.
          amount      : order.amount - credit,

          capture     : capture
        }, user);
        yield order.update({
          service  : config.service,
          chargeId : charge.id,
          status   : capture ? 'paid' : 'authorized'
        });
      } catch (ex) {
        // This more or less says we were unable to chage the user.
        // If we are capturing, as in, we expected to charge them,
        // this is a splendid time to modify their credit with us.
        if (capture) {
          // We failed to chage order.amount so that's what our math is.
          // It's not more complex than that.
          yield user.update({ credit: user.credit - order.amount });

          // A failed charge needs to be marked as such (see #670).
          yield order.update({ status: 'failed' });

          // And finally we tell them (also covered in #670).
          yield notify.sendTextMessage(user, 'Hi. Unfortunately we were unable to charge your credit card for your last ride. Please call us to help resolve this issue');
        }
        // We need to pass up this error because it's being handled
        // above us.
        throw ex;

        // This is here in case someone is sloppy and removes the 
        // above line in the future, leading to a very tricky and
        // hard to catch fall-through bug.
        return charge;
      }

      // If we got here then we've successfully changed the user 
      // some amount. You can look over the math as many times as
      // you want, but arriving here means their credit will be 0.
      if (capture) {
        yield user.update({ credit: 0 });
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
        yield user.update({ credit: credit - order.amount });

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

  /**
   * Cancel pending payment
   * @param {Object} order
   * @param {Object} user
   * @param {Object} charge
   * @return {Void}
   */
  static *cancel(order, user, charge) {
    let service = this.getService(config.service, 'charges');
    yield service.refund(charge.id);
    yield order.update({
      status : 'refunded'
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

  /**
   * Captures order items
   * @param {Object} order
   * @param {Array} items
   * reeturn {Void}
   */
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

  /**
   * Checks if the provided currency is supported by the shop.
   * @param  {String} currency
   * @return {Void}
   */
  static verifyCurrency(currency) {
    if (config.currencies.indexOf(currency) === -1) {
      throw error.parse({
        code    : `SHOP_INVALID_CURRENCY`,
        message : `The requested currency is not supported.`
      }, 400);
    }
  }

  /**
   * Notify user that miscellaneous was added to their booking
   * @param {Object} item
   * @param {Object} user
   * @return {Void}
   */
  static notifyOfCharge(item, user) {
    co(function *() {
      let email = new Email();
      try {
        item.total = (item.quantity * item.price / 100).toFixed(2);

        yield email.send({
          to       : user.email,
          from     : emailConfig.sender,
          subject  : 'Waivecar [Charge Added]',
          template : 'miscellaneous-charge',
          context  : {
            name   : user.name(),
            charge : item
          }
        });
      } catch (err) {
        log.warn('Failed to deliver notification email: ', err);
      }
    });
  }

};
