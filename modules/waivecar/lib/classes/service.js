'use strict';

let Booking = Bento.model('Booking');
let Car     = Bento.model('Car');
let User    = Bento.model('User');
let License = Bento.model('License');
let Card    = Bento.model('Shop/Card');
let error   = Bento.Error;

let notify  = require('../notification-service');

module.exports = class Service {

  /**
   * Attempts to return the request booking.
   * @param  {Number} bookingId
   * @param  {Object} relations
   * @return {Object}
   */
  static *getBooking(bookingId, relations) {
    let booking = yield Booking.findById(bookingId, relations);
    if (!booking) {
      throw error.parse({
        code    : `BOOKING_NOT_FOUND`,
        message : `The requested booking does not exist.`,
        data    : {
          bookingId : parseInt(bookingId)
        }
      }, 400);
    }
    return booking;
  }

  /**
   * Attempts to return the car.
   * @param  {String}  carId     The car id to retrieve.
   * @param  {Number}  userId    The user being assigned to the car if isBooking.
   * @param  {Boolean} isBooking We have special cases when isBooking is true.
   * @return {Object}
   */
  static *getCar(carId, userId, isBooking) {
    let car = yield Car.findById(carId);

    if (!car) {
      throw error.parse({
        code    : `CAR_NOT_FOUND`,
        message : `The requested car does not exist.`
      }, 400);
    }

    // ### Booking
    // If we are booking we need to make sure that the car is available, and that
    // the user is eligible to retrieve a car for booking.

    if (isBooking) {
      let hasCar = yield Car.findOne({ where : { userId : userId } });
      if (hasCar) {
        throw error.parse({
          code    : `CAR_IN_PROGRESS`,
          message : `You are already assigned to another waivecar.`,
          data    : {
            id : hasCar.id
          }
        }, 400);
      }
    }

    if (isBooking && !car.isAvailable) {
      if (parseInt(car.userId) === parseInt(userId)) {
        throw error.parse({
          code    : `CAR_UNAVAILBLE`,
          message : `You are already assigned to this waivecar.`
        }, 400);
      } else {
        throw error.parse({
          code    : `CAR_UNAVAILBLE`,
          message : `The requested waivecar is currently not available.`
        }, 400);
      }
    }

    return car;
  }

  /**
   * Attempts to return the user with the provided id or throws an error.
   * @param  {Number} id
   * @return {Object}
   */
  static *getUser(id) {
    let user = yield User.findById(id);
    if (!user) {
      throw error.parse({
        code    : `INVALID_USER`,
        message : `The user was not found in our records.`
      }, 400);
    }
    return user;
  }

  /**
   * Only allow access if the requesting user owns the record or is an administrator.
   * @param  {Object}  user  The user to be modified.
   * @param  {Object}  _user The user requesting modification.
   * @return {Void}
   */
  static hasAccess(user, _user) {
    if (user.id !== _user.id && !_user.hasAccess('admin')) {
      throw error.parse({
        code    : `BOOKING_INVALID_PRIVILEGES`,
        message : `You do not have the required privileges to perform this operation.`
      }, 400);
    }
  }

  /**
   * Checks if the user account has been approved for booking.
   * @param  {Object}  user
   * @return {Void}
   */
  static *hasBookingAccess(user) {
    let missing = [];
    let license = yield License.findOne({
      where : {
        userId : user.id
      }
    });

    let card = yield user.getCard();

    // ### Check account status
    if (user.status === 'suspended') {
      let reason = yield user.notes({type: 'suspension'}), statedReason = false;
      if (reason.length) {
        statedReason = reason[0].content;
      }

      yield notify.notifyAdmins(`:middle_finger: ${ user.link() } is trying to use the service but is suspended: ${ statedReason }`, [ 'slack' ], { channel : '#user-alerts' });

      if(!statedReason) {
        statedReason = 'The most common reason for a suspended account is an expired credit cards. Try updating your card in the account section';
      } else {
        statedReason = `<br>The given reason is: <b>${ statedReason }</b><br><br>If you feel this can be addressed, call us at <a href="tel:+18559248355">1-855-WAIVE55</a>.`;
      }

      throw error.parse({
        code    : `BOOKING_INVALID_USER`,
        message : `<div style='text-align:left;margin-bottom:1em'>Your account has been suspended. ${statedReason}</div>`
      }, 400);
    } else if (user.status === 'pending') {
      yield notify.notifyAdmins(`:see_no_evil: ${ user.link() } is trying to use the service and is in pending.`, [ 'slack' ], { channel : '#user-alerts' });
      throw error.parse({
        code    : `BOOKING_PENDING_USER`,
        message : `You are not currently approved to book a WaiveCar. Please contact us to activate your account.`
      }, 400);
    } else if (user.status === 'waitlist') {
      let bookingList = yield Booking.find({ where: { userId: user.id } });

      if(bookingList.length > 1) {
        // let this user book because they think they're in. We need to notify the user-alerts channel
        // of our mistake
        yield notify.notifyAdmins(`:speak_no_evil: Woops, ${ user.link() } was supposed to be waitlisted but we accidentally let them use the service already. We're going to just move them to active now.`, [ 'slack' ], { channel : '#user-alerts' });
        yield user.update({status: 'active'});
      } else {
        yield notify.notifyAdmins(`:see_no_evil: ${ user.link() } is trying to use the service and is on the waitlist.`, [ 'slack' ], { channel : '#user-alerts' });
        throw error.parse({
          code    : `BOOKING_INVALID_PRIVILEGES`,
          message : `You're still on the waitlist and cannot book yet. Please contact us for details`
        }, 400);
      }
    }

    if (!user.tested) {
      throw error.parse({
        code    : `USER_READ_RULES`,
        message : `Please read or watch "the rules of the road" in the account section before booking.`
      }, 400);
    }

    if (!user.verifiedPhone) { 
      missing.push('phone'); 
    }

    if (!user.stripeId || !card) { 
      missing.push('credit card'); 
    }

    if (!license || !license.isValid()) {
      missing.push('license');
    }

    if(license && !license.fileId) {
      missing.push('license photo');
    }

    if(card && card.type !== 'credit') {
      throw error.parse({
        code    : `CARD_INVALID`,
        message : `Please make sure you're using a non-prepaid credit card.`
      }, 400);
    }

    if (missing.length) {
      let message = `You are not yet approved to book a WaiveCar. Please ensure your `;
      switch (missing.length) {
        case 1: {
          message = `${ message }${ missing[0] } has been provided and validated.`;
          break;
        }
        default: {
          message = `${ message }${ missing.slice(0, -1).join(', ') } and ${ missing.slice(-1) } have been provided and validated.`;
          break;
        }
      }

      throw error.parse({
        code    : `BOOKING_INVALID_REQUEST`,
        message : message,
        data    : {
          required : missing
        }
      }, 400);
    }
  }

};
