'use strict';

let BookingPayment     = Bento.model('BookingPayment');
let BookingPaymentItem = Bento.model('BookingPaymentItem');

module.exports = class Payment {

  constructor(booking, payment) {
    this.booking = booking;
    this.payment = payment;
    this.items   = [];
  }

  /**
   * Adds a new payment item data to the current payment.
   * @param {Obejct} data
   * @example
   *   yield payment.addItem({
   *     name     : 'charge-low',
   *     quantity : 1,
   *     amount   : 2000
   *   });
   */
  *addItem(data) {
    let item = yield new BookingPaymentItem(Object.assign(data, { paymentId : this.payment.id }));
    yield item.save();

    // ### Add Item
    // Add the items to the payments item list.

    this.items.push(item);
  }

  /**
   * Returns the total value of the current payment.
   * @return {Number}
   */
  getTotal() {
    return this.items.reduce((prevValue, nextValue) => {
      return prevValue + (nextValue.amount * nextValue.quantity);
    }, 0);
  }

  /**
   * Adds a total count value to the JSON output of the payment.
   * @return {Object}
   */
  toJSON() {
    return {
      booking : this.booking,
      payment : this.payment,
      items   : this.items,
      total   : this.getTotal()
    };
  }

};
