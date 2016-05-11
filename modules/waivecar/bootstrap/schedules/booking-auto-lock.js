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
  if (booking.status !== 'completed' && booking.status !== 'closed') {
    let car = yield Car.findById(booking.carId);

    yield cars.lockCar(car.id);

    yield notify.notifyAdmins(`The booking with ${ car.license || car.id } was automaticaly locked and needs manual review | ${ config.api.uri }/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
  }
});

module.exports = function *() {
  scheduler('booking-auto-lock');
};
