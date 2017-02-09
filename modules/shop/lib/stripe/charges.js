'use strict';

module.exports = class StripeCharges {

  constructor(service) {
    this.stripe = service;
  }

  // Charges the provided account.
  //
  // This absurd level of indirection is called
  // from modules/shop/lib/order-service.js @ charge
  //
  *create(charge, user) {
    if (user.stripeId) {
      charge.customer = user.stripeId;
    }
    return yield new Promise((resolve, reject) => {
      this.stripe.charges.create(charge, (err, charge) => {
        if (err) {
          return reject(err);
        }
        resolve(charge);
      });
    });
  }

  // @param  {String} id     The chargeId of the order.
  // @param  {Object} charge The charge object sent to stripe.
  *capture(id, charge) {
    return yield new Promise((resolve, reject) => {
      this.stripe.charges.capture(id, charge, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  *refund(id, charge) {
    return yield new Promise((resolve, reject) => {
      this.stripe.refunds.create({
        charge : id
      }, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  *show(id) {
    return new Promise((resolve, reject) => {
      this.stripe.charges.retrieve(id, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  }

};
