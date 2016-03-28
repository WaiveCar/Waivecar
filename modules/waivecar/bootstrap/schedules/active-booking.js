'use strict';

let notify    = require('../../lib/notification-service');
let cars      = require('../../lib/car-service');
let scheduler = Bento.provider('queue').scheduler;
let Booking   = Bento.model('Booking');
let Location  = Bento.model('BookingLocation');
let Car       = Bento.model('Car');
let User      = Bento.model('User');
let log       = Bento.Log;
let config    = Bento.config;
let geolib    = require('geolib');

module.exports = function *() {
  scheduler.add('active-booking', {
    init   : true,
    repeat : true,
    timer  : config.waivecar.booking.timers.carLocation
  });
};

/**
 * Check if provided lat / long is within 20 mile driving zone
 * @param {Number} lat
 * @param {Number} long
 * @returns boolean
 */
function inDrivingZone(lat, long) {
  let distance = geolib.getDistance({ latitude : lat, longitude : long }, config.waivecar.homebase.coords);
  let miles = distance * 0.000621371;
  return miles <= 20;
}

scheduler.process('active-booking', function *(job) {
  log.info('ActiveBooking : start');
  // Get active bookings
  let bookings = yield Booking.find({ where : { status : 'started' } });

  for (let i = 0, len = bookings.length; i < len; i++) {
    let booking = bookings[i];
    try {
      let car = yield Car.findById(booking.carId);
      let device = yield cars.getDevice(car.id);
      let user = yield User.findById(car.userId);

      if (!device || !car || !user) return;

      // Check if outside driving zone
      if (device.latitude !== car.latitude || device.longitude !== car.longitude) {
        let carInside = inDrivingZone(car.latitude, car.longitude);
        let deviceInside = inDrivingZone(device.latitude, device.longitude);

        if (carInside && !deviceInside) {
          // User has ventured outside of zone

          yield notify.sendTextMessage(user, config.notification.reasons['OUTSIDE_RANGE']);
          yield notify.notifyAdmins(`${ user.name() } took ${ car.license } outside of the driving zone. https://www.waivecar.com/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
        } else if (deviceInside && !carInside) {
          // User has returned to zone
          yield notify.notifyAdmins(`${ user.name() } took ${ car.license } back into the driving zone. https://www.waivecar.com/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
        }
      }

      // Check charge level
      if (device.charge < 30 && car.charge > 30) {
        yield notify.sendTextMessage(user, config.notification.reasons['LOW_CHARGE']);
        yield notify.notifyAdmins(`${ user.name() } has driven ${ car.license } to ${ device.charge }% charge. https://www.waivecar.com/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
      }

      // Log position
      let location = new Location({
        bookingId : booking.id,
        latitude  : car.latitude,
        longitude : car.longitude
      });
      yield location.save();

      yield cars.syncUpdate(car.id, device, car);
    } catch(err) {
      log.warn(`ActiveBooking : failed to handle booking ${ booking.id } : ${ err }`);
    }
  }
});
