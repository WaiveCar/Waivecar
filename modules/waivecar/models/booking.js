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

    /**
     * The user that created the booking.
     * @type {Integer}
     */
    userId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    /**
     * The id of the car used in the booking.
     * @type {String}
     */
    carId : {
      type       : Sequelize.STRING(28),
      allowNull  : false,
      references : {
        model : 'cars',
        key   : 'id'
      }
    },

    /**
     * The cart that has been created for the booking.
     * @type {String}
     */
    cartId : {
      type : Sequelize.STRING
    },

    /**
     * Booking comments.
     * @type {Text}
     */
    comments : {
      type : Sequelize.TEXT()
    },

    // ### File Collection
    // The collectionId represents a unified id for the files that
    // has been attached to the booking.

    collectionId : {
      type : Sequelize.STRING
    },

    flags: {
      type : Sequelize.TEXT()
    },

    /**
     * The boooking status.
     * @type {Enum}
     */
    status : {
      type : Sequelize.ENUM(
        'reserved',  // The booking has been reserved and the car has been made unavailable.
        'pending',   // The booking is pending arrival of the customer.
        'cancelled', // The booking was cancelled and the car has been made available.
        'ready',     // The booking is ready to be started, cancellation is now unavailable.
        'started',   // The booking has started, engine is unlocked and ride timers have been initiated.
        'ended',     // The booking has ended, fee cart created and awaiting completion by valet/customer.
        'completed', // The booking has been completed by valet/customer and car is locked and released.
        'closed'     // The booking has been closed and payment has been requested/collected.
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
    function relations(BookingDetails, BookingPayment) {
      this.hasMany(BookingDetails, { as : 'details',  foreignKey : 'bookingId' });
      this.hasMany(BookingPayment, { as : 'payments', foreignKey : 'bookingId' });
    }
  ];

  /**
   * Possible custom attributes attached to booking outside of schema.
   * @type {Array}
   */
  model.attributes = [
    'status=>user',
    'user=>car',
    'car=>files',
    'files=>details',
    'details=>cart',
    'cart=>payments'
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

    getFlags() {
      return JSON.parse(this.flags) || [];
    },

    isFlagged(what) {
      return this.getFlags().indexOf(what) !== -1;
    },

    *flag(what) {
      if(!this.isFlagged(what)) {
        var flagList = this.getFlags();
        flagList.push(what);

        yield this.update({
          flags: JSON.stringify(flagList)
        });
      }
      return flagList;
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
     * Sets the booking status to ready.
     * @return {Void}
     */
    *ready() {
      yield this.update({
        status : 'ready'
      });
    },

    /**
     * Sets the booking status to started.
     * @return {Void}
     */
    *start() {
      yield this.update({
        status : 'started'
      });
    },

    /**
     * Sets the booking status to ended.
     * @return {Void}
     */
    *end() {
      yield this.update({
        status : 'ended'
      });
    },

    /**
     * Sets the booking status to completed.
     * @return {Void}
     */
    *complete() {
      yield this.update({
        status : 'completed'
      });
    },

    /**
     * Sets the booking status to closed.
     * @return {Void}
     */
    *close() {
      yield this.update({
        status : 'closed'
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
    },

    /**
     * Sets ride reminder schedules.
     * @param {Object} user
     * @param {Object} timers
     */
    *setReminders(user, timers) {

      // ### Free time remains timers

      queue.scheduler.add('booking-free-timer', {
        uid   : `booking-${ this.id }`,
        timer : timers.freeRideReminder,
        data  : {
          phone : user.phone
        }
      });

      // ### Free time expired

      queue.scheduler.add('booking-free-timer-expired', {
        uid   : `booking-${ this.id }`,
        timer : timers.freeRideExpiration,
        data  : {
          phone : user.phone
        }
      });

    },

    /**
     * Removes scheduled ride reminders.
     */
    *delReminders() {
      queue.scheduler.cancel('booking-free-timer', `booking-${ this.id }`);
      queue.scheduler.cancel('booking-free-timer-expired', `booking-${ this.id }`);
    },

    /**
     * Sets booking auto lock to 5 minutes.
     */
    *setAutoLock() {
      queue.scheduler.add('booking-auto-lock', {
        uid   : `booking-${ this.id }`,
        timer : {
          value : 5,
          type  : 'minutes'
        },
        data : {
          bookingId : this.id
        }
      });
    }

  };

  return model;

});
