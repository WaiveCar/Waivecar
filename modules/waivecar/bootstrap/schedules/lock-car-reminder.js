'use strict';

let notify    = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;
let Booking   = Bento.model('Booking');
let Car       = Bento.model('Car');
let config    = Bento.config;
let log       = Bento.Log;
let error     = Bento.Error;

module.exports = function *() {
  scheduler('lock-car-notification');
};

scheduler.process('lock-car-notification', function *(job) {
  log.info('lock car notification : start ');
  let booking = yield Booking.findOne({ where : { id : job.data.bookingId } });
   if (!booking) {
    throw error.parse({
      code    : 'LOCK_CAR_NOTIFICATION',
      message : 'Could not find a booking with the provided id',
      data    : {
        id : job.data.bookingId
      }
    });
  }

  if (booking.status !== 'completed' && booking.status !== 'closed') {
    let car = yield Car.findById(booking.carId);

    if (!car.isLocked) {
      yield notify.sendPushNotification(booking.userId, `We noticed you turned your WaiveCar off. Did you want to end your rental or just lock the car?
      *You won't receive this alert if you lock the car in the app after turning off the car.`);
    }
  }
});



