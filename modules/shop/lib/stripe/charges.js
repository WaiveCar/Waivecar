'use strict';

module.exports = class StripeCharges {

  constructor(service) {
    this.stripe = service;
  }

  /**
   * Charges the provided account.
   * @param  {Object} charge
   * @param  {Object} user
   * @return {Object}
   */
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

  /**
   * Captures a payment.
   * @param  {String} id     The chargeId of the order.
   * @param  {Object} charge The charge object sent to stripe.
   * @return {Object}
   */
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

  /**
   * Refunds a payment.
   * @param  {String} id     The chargeId of the order.
   * @param  {Object} charge
   * @return {Object}
   */
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

  /**
   * Returns payment data.
   * @param  {String} id The chargeId of the order.
   * @return {Object}
   */
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
