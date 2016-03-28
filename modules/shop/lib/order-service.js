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
let notify      = Bento.module('waivecar/lib/notification-service');
let hooks       = Bento.Hooks;
let redis       = Bento.Redis;
let error       = Bento.Error;
let config      = Bento.config.shop;
let emailConfig = Bento.config.email;
let log         = Bento.Log;

module.exports = class OrderService extends Service {

  // ### CREATE

  /**
   * Creates a new order.
   * @param  {Object} payload
   * @param  {Object} [_user]
   * @return {Object}
   */
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
      log.info(`Charged user for time driven : $${ amount / 100 } : booking ${ booking.id }`);
    } catch (err) {
      log.warn(`Failed to charge user for time: ${ user.id }`, err);

      yield notify.notifyAdmins(`Failed to automatically charge ${ user.name() } for time driven: ${ err } | https://www.waivecar.com/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
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
          amount   : amount / 100
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
    let data = yield hooks.require('shop:store:authorize:before', payload, _user);
    let user = yield this.getUser(data.userId);

    this.hasAccess(user, _user);
    this.verifyCurrency(data.currency);

    // ### Validate Amount
    // Checks if a authorized amount has been provided.

    if (!data.amount) {
      throw error.parse({
        code    : `SHOP_AUTHORIZATION_AMOUNT`,
        message : `The request does not provide the required amount to authorize.`
      }, 400);
    }

    // ### Create Order

    let order = new Order({
      createdBy   : _user.id,
      userId      : data.userId,
      source      : data.source,
      description : data.description,
      currency    : data.currency,
      amount      : data.amount
    });
    yield order.save();

    // ### Charge

    yield this.charge(order, user, false);
    yield hooks.call('shop:store:authorize:after', order, data, _user);

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

  /**
   * Attempts to submit an order to the configured payment service.
   * @param  {Object}  order
   * @param  {Object}  user
   * @param  {Boolean} capture
   * @return {Void}
   */
  static *charge(order, user, capture) {
    let service = this.getService(config.service, 'charges');
    let charge  = yield service.create({
      source      : order.source,
      description : order.description,
      metadata    : order.metadata ? JSON.parse(order.metadata) : {},
      currency    : order.currency,
      amount      : order.amount,
      capture     : capture === false ? false : true
    }, user);
    yield order.update({
      service  : config.service,
      chargeId : charge.id,
      status   : capture === false ? 'authorized' : 'paid'
    });
  }

  /**
   * Captures the provided order.
   * @param  {Object} order
   * @return {Void}
   */
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
