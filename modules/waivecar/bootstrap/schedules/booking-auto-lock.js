'use strict';

let notify    = require('../../lib/notification-service');
let cars      = require('../../lib/car-service');
let bookingService   = require('../../lib/booking-service');
let scheduler = Bento.provider('queue').scheduler;
let Booking   = Bento.model('Booking');
let User      = Bento.model('User');
let Car       = Bento.model('Car');
let log       = Bento.Log;
let error     = Bento.Error;
let config    = Bento.config;

scheduler.process('booking-complete-check', function *(job) {
  let booking = yield Booking.findOne({ where : { id : job.data.bookingId } });
  let user = yield User.findById(booking.userId);
  try {
    yield bookingService._complete(job.data.bookingId, user);
  } catch (ex) {
    // so if we get here then the user forgot to do a few things.
    //yield notify.sendTextMessage(user, 'Hi! Thanks for using WaiveCar. This is a courtesy reminder to make sure you ' + ex.message + '. Thanks.');
  }
});

// We are offloading the locking of the car to be outside the complete code in
// order to potentially fix some issues with ending rides
scheduler.process('booking-now-lock', function *(job) {
  let carId = job.data.carId;

  console.log("Trying to lock car");
  if(!carId) {
    let booking = yield Booking.findOne({ where : { id : job.data.bookingId } });
    carId = booking.carId;
  }

  let user = yield User.findById(job.data.userId);
  let car = yield Car.findById(carId);

  yield cars.lockCar(car.id, user);
  yield cars.lockImmobilizer(car.id, user); 
});

scheduler.process('booking-auto-lock', function *(job) {
  try {
    let booking = yield Booking.findOne({ where : { id : job.data.bookingId } });
    if (!booking) {
      throw error.parse({
        code    : 'BOOKING_AUTO_LOCK',
        message : 'Could not find a booking with the provided id',
        data    : {
          id : job.data.bookingId
        }
      });
    }

    let user = yield User.findById(booking.userId);

    if (booking.status !== 'completed' && booking.status !== 'closed') {
      let car = yield Car.findById(booking.carId);

      // We need to try to find out why this isn't working.
      let reason = [];

      if (car.is_ignition_on) {
        reason.push('ignition is on');
      }
      if (!car.is_locked) {
        reason.push('left unlocked (locking now)');
      }
      if (!car.is_key_secure) {
        reason.push("key isn't in holder");
      }
      if(!car.is_door_open) {
        reason.push("doors are open or ajar");
      }

      if(reason.length) {
        reason = 'reason(s): ' + reason.join(', ');
      } else {
        reason = 'reason unknown (ignition is off, doors are locked, and the key is in the holder)'; 
      }

      yield cars.lockCar(car.id);

      yield notify.notifyAdmins(`:closed_lock_with_key: ${ user.link() }'s booking with ${ car.info() } was automaticaly locked and needs manual review | ${ reason } ${ booking.link() }`, [ 'slack' ], { channel : '#rental-alerts' });
    }
  } catch(ex) {
    console.log("Unable to auto-complete: ", ex);
  }
});

module.exports = function *() {
  scheduler('booking-auto-lock');
};
