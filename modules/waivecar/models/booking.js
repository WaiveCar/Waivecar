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
        'new-booking',
        'payment-authorized',
        'pending-arrival',
        'in-progress',
        'pending-payment',
        'cancelled',
        'completed'
      ),
      defaultValue : 'new-booking'
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

    /**
     * Returns the booking status in a human readable manner.
     * @return {String}
     */
    getStatus : function() {
      return this.status.replace('-', ' ');
    },

    /**
     * Cancels the booking by updating the status to cancelled and removing
     * any auto cancel jobs registered with queue provider.
     * @return {Void}
     */
    cancel : function *() {
      yield this.update({
        status : 'cancelled'
      });
    },

    /**
     * Sets the booking state to in progress.
     * @return {Void}
     */
    inProgress : function *() {
      yield this.update({
        status : 'in-progress'
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
     | autoCancel()
     |
     |  When placing a booking in the system the user has a set amount of time to
     |  get the booking into a confirmed state. If they do not perform the required
     |  actions within the time alotted their booking will automaticaly be cancelled.
     |
     | setRideTimer()
     |
     |  Starts the ride timer which automaticaly informs the user of timed ride
     |  events, most notably the sms notification of remaining time nears the end.
     |
     */

    /**
     * Sets the booking to cancel itself automaticaly after the set time.
     * @param  {Number} time
     * @return {Void}
     */
    setCancelTimer : function *(time) {
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
    delCancelTimer : function *() {
      queue.scheduler.cancel('booking-auto-cancel', `booking-${ this.id }`);
    }

  };

  return model;

});
