'use strict';

let booking = require('./lib/booking');
let hooks   = Bento.Hooks;

/*
  Prepare provided customer data, this hook is reuquired by the customer service
  and acts as a filter to make sure that unwanted data is not being processed.
  This is also where you can prepare back end driven data.

  @param {String} type The type of customer interaction, create, or update.
  @param {Object} data
 */
hooks.set('payment:customer', function *(type, data) {
  return {
    description  : data.description,
    subscription : data.subscription,
    metadata     : data.metadata
  };
});

/*
  Validates a payment request before attempting to charge a customer.
  @param {Object} data
 */
hooks.set('payment:validate', function *(data) {
  if (data.bookingId) {
    yield booking.validate(data.bookingId);
  }
});

/*
  Executes when a charge has been authorized for two-step payments.
  @param {Object} data
  @param {Object} payment
 */
hooks.set('payment:authorized', function *(data, payment) {
  if (data.bookingId) {
    yield booking.authorized(data.bookingId, payment.id);
  }
});

/*
  Executes when a charge has been successfully processed.
  @param {Object} data
  @param {Object} payment
 */
hooks.set('payment:paid', function *(data, payment) {
  if (data.bookingId) {
    yield booking.completed(data.bookingId);
  }
});

/*
  Executes when a charge has been successfully refunded.
  @param {Object} data
  @param {Object} payment
 */
hooks.set('payment:refunded', function *(data, payment) {
  if (data.bookingId) {
    yield booking.completed(data.bookingId);
  }
});
