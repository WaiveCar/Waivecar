'use strict';
let fs          = require('fs');

module.exports = class StripeCharges {

  constructor(service) {
    this.stripe = service;
  }

  log(action, options, response, extra) {
    let payload = [new Date(), action, options, response];

    if(extra) {
      payload.push(extra);
    }

    fs.appendFileSync('/var/log/outgoing/stripe.txt', JSON.stringify(payload) + "\n");
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
      this.stripe.charges.create(charge, (err, res) => {

        this.log('charge', charge, [err, res], user);

        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  // @param  {String} id     The chargeId of the order.
  // @param  {Object} charge The charge object sent to stripe.
  *capture(id, charge) {
    return yield new Promise((resolve, reject) => {
      this.stripe.charges.capture(id, charge, (err, res) => {

        this.log('capture', charge, [err, res], {id: id});

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

        this.log('refund', {id: id}, [err, res]);

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
