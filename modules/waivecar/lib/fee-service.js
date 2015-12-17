'use strict';

let CartService    = Bento.module('shop/lib/cart-service');
let Booking        = Bento.model('Booking');
let BookingDetails = Bento.model('BookingDetails');

module.exports = class FeeService {

  /**
   * Creates a new shopping cart with automated fees.
   * @param  {Object} booking
   * @param  {Object} car
   * @param  {Object} _user
   * @return {Void}
   */
  static *create(booking, car, _user) {
    let items = [];
    let start = yield this.getDetails('start', booking.id);
    let end   = yield this.getDetails('end', booking.id);

    // ### Ride Fees
    // Calculate fees based on the ride.

    if (start && end) {
      // Calculate ride time and add x time fee per hour over 2 hours...
    }

    // ### Car Fees
    // Calculate fees pertaining to the cars current status.

    if (car.charge < 20) {
      items.push({
        id       : 1,
        quantity : 1
      });
    }

    // ### Test
    // Just a test so we actually get a value when testing.

    items.push({
      id       : 2,
      quantity : 1
    });

    if (items.length) {
      let cart = yield CartService.create({
        items : items
      }, true);
      yield booking.update({
        cartId : cart.id
      });
    }
  }

  /**
   * Returns a cart.
   * @param  {String} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *get(id, _user) {
    if (id) {
      return yield CartService.show(id, _user);
    }
  }

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

};
