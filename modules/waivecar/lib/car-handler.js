'use strict';

let Car         = Reach.model('Car');
let CarStatus   = Reach.model('CarStatus');
let CarLocation = Reach.model('CarLocation');

/**
 * @class CarHandler
 */
let CarHandler = module.exports = {};

/**
 * Check if the provided user is the driver of a car, if a user is already
 * assigned as a driver we throw a in progress error.
 * @private
 * @method hasDriver
 * @param  {Int} id
 */
CarHandler.hasDriver = function *(id) {
  let count = yield CarStatus.count({ driverId : id });
  if (count !== 0) {
    throw error.parse({
      code    : 'CAR_IN_PROGRESS',
      message : 'You are already assigned to another waivecar'
    }, 400);
  }
};

/**
 * @method isAvailable
 * @param  {String} id
 * @return {Boolean}
 */
CarHandler.isAvailable = function *(id) {
  let count = yield Car.count({ id : id });
  if (count === 0) {
    throw error.parse({
      code    : 'CAR_INVALID',
      message : 'The requested car does not exist'
    }, 400);
  }
  let state  = yield CarStatus.findOne({ where : { carId : id }});
  if (state && state.status === 'unavailable') {
    throw error.parse({
      code    : 'CAR_UNAVAILABLE',
      message : 'The selected car is unavailable for booking'
    }, 400);
  }
  return true;
}

/**
 * Returns a cars current latitude and longitude.
 * @method getLocation
 * @param  {String} carId
 * @return {CarLocation}
 */
CarHandler.getLocation = function *(carId) {
  return yield CarLocation.findById(carId);
};

/**
 * @method setStatus
 * @param  {String} status
 * @param  {String} carId
 * @param  {Object} user
 */
CarHandler.setStatus = function *(status, carId, user) {
  let carStatus = null;
  switch (status) {
    case 'unavailable':
      carStatus = new CarStatus({
        carId    : carId,
        driverId : user.id,
        status   : status
      });
      yield carStatus.upsert();
      break;
    case 'available':
      carStatus          = yield CarStatus.findById(carId);
      carStatus._actor   = user;
      carStatus.driverId = null;
      carStatus.status   = status;
      yield carStatus.update('carId');
      break;
    default:
      throw error.parse({
        code     : 'BOOKING_BAD_STATUS',
        message  : 'You must set a valid booking status',
        solution : 'Check callers of the setCarStatus method on Bookings class and make sure it is setting valid states'
      });
  }
};