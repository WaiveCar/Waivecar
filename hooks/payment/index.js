'use strict';

let Booking = Reach.model('Booking');
let Payment = Reach.model('Payment');
let hooks   = Reach.Hooks;
let error   = Reach.Error;

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
  }
});

/*
  Validates a payment request before attempting to charge a customer.
  @param {Object} data
 */
hooks.set('payment:validate', function *(data) {
  // ... 
});

/*
  Executes when a charge has been authorized for two-step payments.
  @param {Object} data
  @param {Object} payment
 */
hooks.set('payment:authorized', function *(data, payment) {
  // ... 
});

/*
  Executes when a charge has been successfully processed.
  @param  {Object} data
  @param  {Object} payment
 */
hooks.set('payment:paid', function *(data, payment) {
  // ... 
});