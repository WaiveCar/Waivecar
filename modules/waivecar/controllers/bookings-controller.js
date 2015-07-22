'use strict';

let booking = require('../classes/booking');

module.exports = (function () {

  /**
   * @class BookingsController
   */
  function BookingsController() {}

  /**
   * @method create
   * @param  {Object} post
   */
  BookingsController.prototype.create = function *(post) {
    return yield booking.create(post.carId, this.auth.user);
  };

  /**
   * @method pendingArrival
   * @param  {Int} id
   */
  BookingsController.prototype.pendingArrival = function *(id) {
    return yield booking.pendingArrival(id, this.auth.user);
  };

  /**
   * @method start
   * @param  {Int} id
   */
  BookingsController.prototype.start = function *(id) {
    return yield booking.start(id, this.auth.user);
  };

  /**
   * @method cancel
   * @param  {Int} id
   */
  BookingsController.prototype.cancel = function *(id) {
    return yield booking.cancel(id, this.auth.user);
  };

  return BookingsController;

})();