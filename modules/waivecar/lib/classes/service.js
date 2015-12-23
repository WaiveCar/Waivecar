'use strict';

let Booking = Bento.model('Booking');
let Car     = Bento.model('Car');
let User    = Bento.model('User');
let License = Bento.model('License');
let Card    = Bento.model('Shop/Card');
let error   = Bento.Error;

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

    let card = yield Card.findOne({
      where : {
        userId : user.id
      }
    });

    // ### Check User
    if (!user.verifiedEmail) { missing.push('email'); }
    if (!user.verifiedPhone) { missing.push('phone'); }

    // ### Check Credit Card
    if (!user.stripeId || !card) { missing.push('credit card'); }

    // ### Check License
    if (!license || !license.isValid()) {
      missing.push('license');
    }

    // we may want this later, but lets leave it out now as it doesnt match the app flow.
    // if(license && !license.fileId) {
    //  missing.push('license photo');
    // }

    // ### Throw Error
    if (missing.length) {
      let message = `You are not yet approved to book a WaiveCar. Please ensure your `;
      switch (missing.length) {
        case 1: {
          message = `${ message }${ missing[0] } has been provided and validated.`;
          break;
        }
        case 2: {
          message = `${ message }${ missing.join(' and ') } have been provided and validated.`;
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
