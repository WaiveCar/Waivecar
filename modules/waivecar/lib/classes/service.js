'use strict';

let Car   = Reach.model('Car');
let User  = Reach.model('User');
let error = Reach.Error;

module.exports = class Service {

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

    if (isBooking && !car.available) {
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
   * Only allow access if the requesting user is the actor or is administrator.
   * @param  {Object}  user  The user to be modified.
   * @param  {Object}  _user The user requesting modification.
   * @return {Boolean}
   */
  static hasAccess(user, _user) {
    if (user.id !== _user.id && _user.role !== 'admin') {
      throw error.parse({
        error   : `INVALID_PRIVILEGES`,
        message : `You do not have the required privileges to perform this operation.`
      }, 400);
    }
  }

}