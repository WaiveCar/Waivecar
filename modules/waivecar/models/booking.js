'use strict';

let queue = Bento.provider('queue');

Bento.Register.Model('Booking', 'sequelize', function(model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'bookings';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    userId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    carId : {
      type       : Sequelize.STRING(28),
      allowNull  : false,
      references : {
        model : 'cars',
        key   : 'id'
      }
    },

    comments : {
      type : Sequelize.TEXT()
    },

    // ### File Collection
    // The collectionId represents a unified id for the files that
    // has been attached to the booking.

    collectionId : {
      type : Sequelize.STRING
    },

    status : {
      type : Sequelize.ENUM(
        'reserved',  // The booking has been reserved and the car has been made unavailable.
        'pending',   // The booking is pending arrival of the customer.
        'cancelled', // The booking was cancelled and the car has been made available.
        'started',   // The booking has started, cancellation is now unavailable.
        'ended',     // The booking has ended, pending inspection and fees.
        'completed'  // The booking has been inspected and payment has been requested/collected.
      ),
      defaultValue : 'reserved'
    }
  };

  /**
   * The relation definitions of your model.
   * @property relations
   * @type     Array
   */
  model.relations = [
    'BookingDetails',
    'BookingPayment',
    function(BookingDetails, BookingPayment) {
      this.hasMany(BookingDetails, { as : 'details',  foreignKey : 'bookingId' });
      this.hasMany(BookingPayment, { as : 'payments', foreignKey : 'bookingId' });
    }
  ];

  // ### Methods
  // A list of methods attached to the model.

  model.methods = {

    /*
     |--------------------------------------------------------------------------------
     | Booking Status
     |--------------------------------------------------------------------------------
     */

    /**
     * Returns the booking status in a human readable manner.
     * @return {String}
     */
    getStatus() {
      return this.status.replace('-', ' ');
    },

    /**
     * Cancels the booking by updating the status to cancelled.
     * @return {Void}
     */
    *cancel() {
      yield this.update({
        status : 'cancelled'
      });
    },

    /**
     * Sets the booking state to in progress.
     * @return {Void}
     */
    *start() {
      yield this.update({
        status : 'started'
      });
    },

    /**
     * Sets the booking state to in progress.
     * @return {Void}
     */
    *end() {
      yield this.update({
        status : 'ended'
      });
    },

    /**
     * Sets the booking state to in progress.
     * @return {Void}
     */
    *complete() {
      yield this.update({
        status : 'completed'
      });
    },

    /*
     |--------------------------------------------------------------------------------
     | Booking Timers
     |--------------------------------------------------------------------------------
     |
     | List of booking timer methods used for automatic handling of booking based
     | on various timers set.
     |
     */

    /**
     * Sets the booking to cancel itself automaticaly after the set time.
     * @param  {Number} time
     * @return {Void}
     */
    *setCancelTimer(time) {
      queue.scheduler.add('booking-auto-cancel', {
        uid   : `booking-${ this.id }`,
        timer : time,
        data  : {
          bookingId : this.id
        }
      });
    },

    /**
     * Removes the automatic cancellation of the booking.
     * @return {Void}
     */
    *delCancelTimer() {
      queue.scheduler.cancel('booking-auto-cancel', `booking-${ this.id }`);
    }

  };

  return model;

});
