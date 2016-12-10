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
let redis     = require('../../lib/redis-service');
let uuid      = require('uuid');
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

function *shouldProcess(bookingId) {
  //
  // Currently (2016-12-09) the scheduler goes every 45 seconds and there's
  // a 30 second timeout on the api call to get the car info. Ideally, these
  // things shouldn't matter - but I'm pretending they do just in case.
  //
  // A smart observer will notice there's a way this leads to a remote 
  // possibility of a booking being skipped one time ... you get extra 
  // points - but honestly that's unlikely and not a big deal.
  //
  let lockTimeMS = 40000;
  let key = `booking-loop-lock:${ bookingId }`;

  // The uuid here is used to work around the fact that get/set isn't atomic.
  let uniq = uuid.v4();

  // The nx will only only succeed if the key hasn't been set. 
  let canProceed = yield redis.set(key, uniq, 'nx', 'px', lockTimeMS);
  let check = yield redis.get(key);
  return (canProceed && check === uniq);
}

scheduler.process('active-booking', function *(job) {
  log.info('ActiveBooking : start');
  let bookings = yield Booking.find({ where : { status : 'started' } });

  for (let i = 0, len = bookings.length; i < len; i++) {
    let booking = bookings[i];
    try {
      //
      // We need to make sure multiple servers don't process the same booking
      // simultaneously. There's many bad ideas and complicated solutions for
      // dealing with this and those sound really fun to write.
      //
      // I think the easiest way to scale this horizontally without using some
      // form of distributed web-workers with a thread-pool is to use 
      // http://redis.io/topics/distlock
      // 
      // We let the lock expire "naturally" after the elapsing of lockTimeMS
      //
      if (!(yield shouldProcess(booking.id))) {
        continue;
      }

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
          yield notify.notifyAdmins(`${ car.info() } has been driven ${ milesDriven } miles since last change reported, but charge level has not changed. ${ config.api.uri }/cars/${ car.id }`, [ 'slack' ], { channel : '#rental-alerts' });
        }


        duration = moment().utc().diff(start.createdAt, 'minutes');

        //
        // Send a message 1hr 45 min into ride #578
        //
        // We give the user a 15 minute warning to end their ride.
        //
        // 2 * 60 = 120 - (15 + 2) = 103 ... we are doing it at 17 minutes
        // to avoid issues with latency
        //
        if (duration >= 103 && !booking.isFlagged('1hr45-warning')) {
          yield booking.flag('1hr45-warning');
          yield notify.sendTextMessage(user, config.notification.reasons['NEAR_END']);
        }
        //
        // New user rental warning (under 5 rentals, over 3 hours) #463
        //
        // Send an alert to 'rental alerts' if a new user (less than 5 trips) has taken a car for longer than 3 hours. 
        //
        if (duration >= 180 && !booking.isFlagged('new-user-long-rental')) {
          yield booking.flag('new-user-long-rental');
          booking_history = yield Booking.find({ where : { userId : user.id }});

          if(booking_history.length < 5) {
            yield notify.notifyAdmins(`:cactus: ${ user.name() } drove ${ car.info() } ${ duration } minutes who has only rented ${ booking_history.length } times. <${ user.phone || user.email }>`, [ 'slack' ], { channel : '#rental-alerts' });
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
          yield notify.notifyAdmins(`${ user.name() } took ${ car.info() } outside of the driving zone. ${ config.api.uri }/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
        } else if (deviceInside && !carInside) {
          // User has returned to zone
          yield notify.notifyAdmins(`${ user.name() } took ${ car.info() } back into the driving zone. ${ config.api.uri }/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
        }
      }

      // Check charge level
      // See Api: Low charge text message triggers #495 
      if (car.averageCharge() < 20 && !booking.isFlagged('low-charge')) {
        // make sure an excess number of messages aren't sent
        // and that they are only sent when the average dips below 20
        yield booking.flag('low-charge');

        yield notify.sendTextMessage(user, config.notification.reasons['LOW_CHARGE']);
        yield notify.notifyAdmins(`:battery: ${ user.name() } has driven ${ car.info() } to a low charge. ${ car.chargeReport() }. ${ config.api.uri }/bookings/${ booking.id }`, [ 'slack' ], { channel : '#rental-alerts' });
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
