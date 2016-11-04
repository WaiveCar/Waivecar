'use strict';

let notify    = require('../../lib/notification-service');
let cars      = require('../../lib/car-service');
let scheduler = Bento.provider('queue').scheduler;
let Booking   = Bento.model('Booking');
let Car       = Bento.model('Car');
let log       = Bento.Log;
let error     = Bento.Error;
let config    = Bento.config;

scheduler.process('booking-auto-lock', function *(job) {
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
  let user = yield this.getUser(booking.userId);
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

    if(reason.length) {
      reason = 'reason(s): ' + reason.join(', ');
    } else {
      reason = 'reason unknown (ignition is off, doors are locked, and the key is in the holder)'; 
    }


    yield cars.lockCar(car.id);

    yield notify.notifyAdmins(`:closed_lock_with_key: ${ user.name() }'s booking with ${ car.info() } was automaticaly locked and needs manual review | ${ reason } ${ config.api.uri }/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
  }
});

module.exports = function *() {
  scheduler('booking-auto-lock');
};
