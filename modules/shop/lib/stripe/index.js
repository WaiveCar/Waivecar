'use strict';

let StripeCustomers = require('./customers');
let StripeCards     = require('./cards');
let StripeCharges   = require('./charges');
let config          = Bento.config.shop;
let error           = Bento.Error;

// ### Stripe Service Configuration

let stripe = (function() {
  if (!config.stripe) {
    throw error.parse({
      code     : 'PAYMENTS_STRIPE_CONFIG',
      message  : 'Missing configuration for payment service [Stripe]',
      solution : 'Make sure to set up the correct configuration for your Stripe account'
    });
  }
  return require('stripe')(config.stripe.secret);
})();

// ### Instances

let customers = new StripeCustomers(stripe);
let cards     = new StripeCards(stripe);
let charges   = new StripeCharges(stripe);

// ### Export Stripe

module.exports = {
  customers : customers,
  cards     : cards,
  charges   : charges
};
