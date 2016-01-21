'use strict';

let Payment = Bento.model('Shop/Order');
let hooks   = Bento.Hooks;
let error   = Bento.Error;
let log     = Bento.Log;

module.exports = class Handler {

  /**
   * Handles a captured payment event that has been processed in the
   * stripe dashboard.
   * @param {Object} payload
   */
  static *captured(payload) {
    let charge  = payload.data.object;
    let payment = yield this.getPayment(charge.id);

    // ### Update Payment

    yield payment.update({
      status   : 'paid',
      amount   : charge.amount,
      refunded : charge.amount_refunded
    });

    // ### Log

    let charged  = charge.amount / 100;
    let refunded = charge.amount_refunded / 100;

    log.info(`Payments > Captured | Payment ID: ${ payment.id } | Charge ID: ${ charge.id } | Charged: ${ charged - refunded } ${ charge.currency }`);

    // ### Paid Hook

    yield hooks.call('payment:paid', charge.metadata, payment);
  }

  /**
   * Handles a refunded payment event that has been processed in the
   * stripe dashboard.
   * @param {Object} payload
   */
  static *refunded(payload) {
    let charge  = payload.data.object;
    let payment = yield this.getPayment(charge.id);

    // ### Update Payment

    yield payment.update({
      status   : 'refunded',
      refunded : charge.amount_refunded
    });

    // ### Log

    log.info(`Payments > Refunded | Payment ID: ${ payment.id } | Charge ID: ${ charge.id } | Total Refund: ${ charge.amount_refunded / 100 } ${ charge.currency }`);

    // ### Refunded Hook

    yield hooks.call('payment:refunded', charge.metadata, payment);
  }

  /**
   * Returns a payment based on incoming charge id or throw 404.
   * @param  {String} id
   * @return {Object} payment
   */
  static *getPayment(id) {
    let payment = yield Payment.findOne({
      where : {
        chargeId : id
      }
    });

    // ### Validate Payment
    // Check if the payment exists in the API records.

    if (!payment) {
      throw error.parse({
        code     : `PAYMENT_NOT_FOUND`,
        message  : `No stripe payment with chargeId ${ id } was found in our records.`,
        solution : `Payments must be registered via the API before they are handled in the stripe dashboard.`
      }, 404);
    }

    return payment;
  }

};
