'use strict';
let apiConfig   = Bento.config.api;

let queue = Bento.provider('queue');

Bento.Register.Model('Booking', 'sequelize', function(model, Sequelize) {
  model.table = 'bookings';

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

    cartId : {
      type : Sequelize.STRING
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

    flags: {
      type : Sequelize.TEXT()
    },

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
    },

    parkCount : {
      type : Sequelize.INTEGER,
      defaultValue : 0
    },

    driveCount : {
      type : Sequelize.INTEGER,
      defaultValue : 0
    },
    chargeCount: {
      type : Sequelize.INTEGER,
      defaultValue : 0
    },

    reservationEnd : {
      type : Sequelize.DATE
    },

    freetimeEnd : {
      type : Sequelize.DATE
    },

    createdAt : {
      type : Sequelize.DATE
    }
  };

  model.relations = [
    'BookingDetails',
    'BookingPayment',
    'Report',
    'Car',
    function relations(BookingDetails, BookingPayment, Report, Car) {
      this.hasMany(BookingDetails, { as : 'details',  foreignKey : 'bookingId' });
      this.hasMany(BookingPayment, { as : 'payments', foreignKey : 'bookingId' });
      this.hasMany(Report,         { as : 'reports', foreignKey : 'bookingId' });
      this.belongsTo(Car, { as: 'car', foreignKey : 'carId' });
    }
  ];

  model.attributes = [
    'status=>user',
    'user=>car',
    'car=>files',
    'files=>details',
    'details=>cart',
    'cart=>payments',
    'payments=>carPath'
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

    link() {
      return `<${ apiConfig.uri }/bookings/${ this.id }|Booking ${ this.id }>`;
    },

    getFlags() {
      return this.flags ? JSON.parse(this.flags) : [];
    },

    isFlagged(what) {
      return this.getFlags().indexOf(what) !== -1;
    },

    *swapFlag(outFlag, inFlag) {
      var newFlagList = this.getFlags().filter(function(flag) {
        return flag !== outFlag;
      });
      newFlagList.push(inFlag);

      yield this.update({
        flags: JSON.stringify(newFlagList)
      });

      return newFlagList;
    },

    *unFlag(what) {
      if(this.isFlagged(what)) {
        var newFlagList = this.getFlags().filter(function(flag) {
          return flag !== what;
        });

        yield this.update({
          flags: JSON.stringify(newFlagList)
        });
      }
      return newFlagList;
    },

    *addFlag(what) {
      return yield this.flag(what);
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

    *cancel() {
      yield this.update({
        status : 'cancelled'
      });
    },

    *ready() {
      yield this.update({
        status : 'ready'
      });
    },

    *start() {
      yield this.update({
        status : 'started'
      });
    },

    *end() {
      yield this.update({
        status : 'ended'
      });
    },

    *complete() {
      yield this.update({
        status : 'completed'
      });
    },

    *close() {
      yield this.update({
        status : 'closed'
      });
    },

    isFinished() {
      return (['closed','completed','ended','started','cancelled'].includes(this.status));
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


    // Sets the booking to cancel itself automaticaly after the set time.
    *setCancelTimer(time) {
      queue.scheduler.add('booking-auto-cancel', {
        uid   : `booking-${ this.id }`,
        timer : time.autoCancel,
        data  : {
          bookingId : this.id
        }
      });
      queue.scheduler.add('booking-extension-offer', {
        uid   : `booking-${ this.id }`,
        timer : time.extensionOffer,
        data  : {
          bookingId : this.id
        }
      });
    },

    *delCancelTimer() {
      return queue.scheduler.cancel('booking-auto-cancel', `booking-${ this.id }`);
    },

    //
    // Sets ride reminder schedules.
    // @param {Object} user
    // @param {Object} timers
    // 
    *setReminders(user, timers) {

      if (!user.isWaivework){

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

      }

    },

    /**
     * Removes scheduled ride reminders.
     */
    *delReminders() {
      queue.scheduler.cancel('booking-free-timer', `booking-${ this.id }`);
      queue.scheduler.cancel('booking-free-timer-expired', `booking-${ this.id }`);
    },

    *setForfeitureTimers(user, timers) {
      let uid = `booking-${ this.id }`;
      let relativeTimers = {};
      let data = {
        userId : user.id,
        bookingId : this.id
      };

      ['forfeitureFirstWarning', 'forfeitureSecondWarning', 'forfeiture'].forEach(function(which) {
        relativeTimers[which] = {
          type: 'seconds',
          value: timers[which].value + 0
        }
      });

      queue.scheduler.add('booking-forfeiture-first-warning', {
        uid   : uid,
        timer : relativeTimers.forfeitureFirstWarning,
        data  : data
      });

      queue.scheduler.add('booking-forfeiture-second-warning', {
        uid   : uid,
        timer : relativeTimers.forfeitureSecondWarning,
        data  : data
      });

      queue.scheduler.add('booking-forfeiture', {
        uid   : uid,
        timer : relativeTimers.forfeiture,
        data  : data
      });

    },

    *delForfeitureTimers() {
      let uid = `booking-${ this.id }`;

      queue.scheduler.cancel('booking-forfeiture-first-warning', uid);
      queue.scheduler.cancel('booking-forfeiture-second-warning', uid);
      queue.scheduler.cancel('booking-forfeiture', uid);
    },

    doTask(what, when, opts) {
      let timer = {
        value : when,
        type  : 'minutes'
      };

      if(when < 1) {
        timer.value *= 60;
        timer.type = 'seconds';
      }

      let params = {
        uid   : `booking-${ this.id }`,
        timer : timer,
        data  : Object.assign(opts || {}, {
          bookingId : this.id
        })
      };

      queue.scheduler.add(what, params);
    },

    *setCompleteCheck() {
      this.doTask('booking-complete-check', 1.5);
    },

    *setNowLock(opts) {
      this.doTask('booking-now-lock', 0.15, opts);
    },

    *setAutoLock() {
      this.doTask('booking-auto-lock', 5);
    }

  };

  return model;

});
