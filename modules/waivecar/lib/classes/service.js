'use strict';

let Booking = Bento.model('Booking');
let Car     = Bento.model('Car');
let User    = Bento.model('User');
let License = Bento.model('License');
let error   = Bento.Error;

module.exports = class Service {

  /**
   * Attempts to return the request booking.
   * @param  {Number} bookingId
   * @return {Object}
   */
  static *getBooking(bookingId) {
    let booking = yield Booking.findById(bookingId);
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
          message : `The user is already assigned to another car.`,
          data    : hasCar
        }, 400);
      }
    }

    if (isBooking && !car.isAvailable) {
      if (parseInt(car.userId) === parseInt(userId)) {
        throw error.parse({
          code    : `CAR_UNAVAILBLE`,
          message : `The user is already assigned to this car.`
        }, 400);
      } else {
        throw error.parse({
          code    : `CAR_UNAVAILBLE`,
          message : `The requested car is currently not available.`
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
    if (user.id !== _user.id && _user.role !== 'admin') {
      throw error.parse({
        error   : `INVALID_PRIVILEGES`,
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

    // ### Check Status

    if (!user.verifiedEmail) { missing.push('email'); }
    if (!user.verifiedPhone) { missing.push('phone'); }

    if (!license || license.status !== 'completed') {
      missing.push('license');
    }

    // ### Throw Error

    if (missing.length) {
      throw error.parse({
        code    : `BOOKING_INVALID_REQUEST`,
        message : `Your account must be approved for booking before you can make this request.`,
        data    : {
          required : missing
        }
      }, 400);
    }
  }

};
