'use strict';

let notify    = require('../../lib/notification-service');
let cars      = require('../../lib/car-service');
let scheduler = Bento.provider('queue').scheduler;
let Booking   = Bento.model('Booking');
let BookingDetails = Bento.model('BookingDetails');
let Location  = Bento.model('BookingLocation');
let Car       = Bento.model('Car');
let User      = Bento.model('User');
let log       = Bento.Log;
let config    = Bento.config;
let moment    = require('moment');
let geolib    = require('geolib');
let _         = require('lodash');

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
      let details = yield BookingDetails.find({ where : { bookingId : booking.id } });
      let start = _.find(details, { type : 'start' });
      let car = yield Car.findById(booking.carId);
      let device = yield cars.getDevice(car.id);
      let user = yield User.findById(car.userId);
      let duration = 0;
      let booking_history = null;
      
      if (!device || !car || !user) return;

      if (start) {
        // Check that battery use is changing as expected
        let milesDriven = car.mileage - start.mileage;
        if (milesDriven >= 7 && car.charge === device.charge) {
          yield notify.notifyAdmins(`${ car.license } has been driven ${ milesDriven } miles since last change reported, but charge level has not changed. ${ config.api.uri }/cars/${ car.id }`, [ 'slack' ], { channel : '#rental-alerts' });
        }

        //
        // New user rental warning (under 5 rentals, over 3 hours) #463
        //
        // Send an alert to 'rental alerts' if a new user (less than 5 trips) has taken a car for longer than 3 hours. 
        //
        duration = moment().utc().diff(start.createdAt, 'minutes');
        // TODO: Make sure that the user isn't flagged more than once per booking
        if (duration >= 180 && duration < 181) {
          booking_history = yield Booking.find({ where : { userId : user.id }});

          if(booking_history.length < 5) {
            yield notify.notifyAdmins(`${ car.license } has been driven for ${ duration } minutes by ${ user.name() } who has only rented ${ booking_history.length } times. Driver: ${ user.name() } <${ user.phone || user.email }>`, [ 'slack' ], { channel : '#rental-alerts' });
          }
        }
      }

      // Check if outside driving zone
      if (device.latitude !== car.latitude || device.longitude !== car.longitude) {
        let carInside = inDrivingZone(car.latitude, car.longitude);
        let deviceInside = inDrivingZone(device.latitude, device.longitude);

        if (carInside && !deviceInside) {
          // User has ventured outside of zone
          yield notify.sendTextMessage(user, config.notification.reasons['OUTSIDE_RANGE']);
          yield notify.notifyAdmins(`${ user.name() } took ${ car.license } outside of the driving zone. ${ config.api.uri }/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
        } else if (deviceInside && !carInside) {
          // User has returned to zone
          yield notify.notifyAdmins(`${ user.name() } took ${ car.license } back into the driving zone. ${ config.api.uri }/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
        }
      }

      // Check charge level
      if (device.charge < 20 && car.charge > 20) {
        yield notify.sendTextMessage(user, config.notification.reasons['LOW_CHARGE']);
        yield notify.notifyAdmins(`${ user.name() } has driven ${ car.license } to ${ device.charge }% charge (normalized: ${ car.averageCharge() }). ${ config.api.uri }/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
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
      log.warn(`ActiveBooking : failed to handle booking ${ booking.id } : ${ err } (${ err.stack })`);
    }
  }
});
