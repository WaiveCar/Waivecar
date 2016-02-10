'use strict';

let notify    = require('../../lib/notification-service');
let cars      = require('../../lib/car-service');
let scheduler = Bento.provider('queue').scheduler;
let Booking   = Bento.model('Booking');
let Car       = Bento.model('Car');
let User      = Bento.model('User');
let log       = Bento.Log;
let config    = Bento.config;
let inside    = require('point-in-polygon');

module.exports = function *() {
  scheduler.add('booking-location', {
    init   : true,
    repeat : true,
    timer  : config.waivecar.booking.timers.carLocation
  });
};

scheduler.process('booking-location', function *(job) {
  let bookings = yield Booking.find({ where : { status : 'started' } });

  for (let i = 0, len = bookings.length; i < len; i++) {
    let booking = bookings[i];
    let car = yield Car.findById(booking.carId);
    let device = yield cars.getDevice(car.id);

    if (device.latitude !== car.latitude && device.longitude !== car.longitude) {
      let carInside = inside([ car.longitude, car.latitude ], config.waivecar.homebase.coords);
      let deviceInside = inside([ device.longitude, device.latitude ], config.waivecar.homebase.coords);

      if (carInside && !deviceInside) {
        // User has ventured outside of zone
        let user = yield User.findById(car.userId);

        yield notify.sendTextMessage(user, config.notification.reasons['OUTSIDE_RANGE']);
        yield notify.notifyAdmins(`${ user.name() } took ${ car.license } outside of the driving zone. https://www.waivecar.com/bookings/${ booking.id }`, [ 'slack' ]);
      } else if (deviceInside && !carInside) {
        // User has returned to zone
        yield notify.notifyAdmins(`${ user.name() } took ${ car.license } back into the driving zone. https://www.waivecar.com/bookings/${ booking.id }`, [ 'slack' ]);
      }
    }
    yield cars.syncUpdate(car.id, device, car);
  }
});
