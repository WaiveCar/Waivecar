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
let co        = require('co');

module.exports = function *() {
  scheduler.add('active-booking', {
    init   : true,
    repeat : true,
    timer  : config.waivecar.booking.timers.carLocation
  });
};

// Check if provided lat / long is within 20 mile driving zone
function inDrivingZone(lat, long) {
  let distance = geolib.getDistance({ latitude : lat, longitude : long }, config.waivecar.homebase.coords);
  let miles = distance * 0.000621371;
  return miles <= 20;
}

var checkBooking = co.wrap(function *(booking) {
  let details = yield BookingDetails.find({ where : { bookingId : booking.id } });
  let start = _.find(details, { type : 'start' });
  let car = yield Car.findById(booking.carId);
  let device = yield cars.getDevice(car.id, null, 'booking-loop');
  let user = yield User.findById(car.userId);
  let duration = 0;
  let booking_history = null;
  
  if (!device || !car || !user) return;

  if (start) {
    // Check that battery use is changing as expected
    let milesDriven = (car.mileage - start.mileage) * 0.621371;
    if (milesDriven >= 7 && car.charge === device.charge) {
      yield notify.notifyAdmins(`${ car.info() } has been driven ${ milesDriven } miles since last change reported, but charge level has not changed. ${ config.api.uri }/cars/${ car.id }`, [ 'slack' ], { channel : '#rental-alerts' });
    }

    duration = moment().utc().diff(start.createdAt, 'minutes');

    //
    // Send a message 1hr 45 min into ride #578
    //
    // We give the user a 15 minute warning to end their ride.
    //
    // 2 * 60 = 120 - (15 + 1) = 103 ... we are doing it at 16 minutes
    // to avoid issues with latency
    //
    if (!user.isWaivework) {
      if (duration >= 104 && !booking.isFlagged('1hr45-warning')) {
        yield booking.flag('1hr45-warning');
        yield notify.sendTextMessage(user, config.notification.reasons['NEAR_END']);
      }

      if (duration >= 11 * 60 && !booking.isFlagged('11h-warning')) {
        yield booking.flag('11h-warning');
        yield notify.notifyAdmins(`:waning_crescent_moon: ${ user.name() } has had ${ car.info() } for 11 hours`, [ 'slack' ], { channel : '#rental-alerts' });
        yield notify.sendTextMessage(user, 'Hey there, WaiveCar has a 12 hour rental limit. Please end your rental in the next hour. Thanks!');
      }
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
        yield notify.notifyAdmins(`:cactus: ${ user.name() } drove ${ car.info() } ${ duration } minutes but has only rented ${ booking_history.length } times. ${ user.phone || user.email }`, [ 'slack' ], { channel : '#rental-alerts' });
      }
    }
  }

  // Check if outside driving zone
  let deviceInside = inDrivingZone(device.latitude, device.longitude);

  if (!user.isWaivework) {
    // if we thought we were outside but now we're inside
    if (deviceInside && booking.isFlagged('outside-range')) {
      yield booking.unFlag('outside-range');
      yield notify.notifyAdmins(`:waving_white_flag: ${ user.link() } took ${ car.info() } back into the driving zone. ${ booking.link() }`, [ 'slack' ], { channel : '#rental-alerts' });

    // if we thought we were inside but now we are outside.
    } else if (!deviceInside && !booking.isFlagged('outside-range')) {
      let isLevel = yield car.hasTag('level');
      if(!isLevel) {
        yield booking.flag('outside-range');
        yield notify.sendTextMessage(user, config.notification.reasons['OUTSIDE_RANGE']);
        yield notify.notifyAdmins(`:waving_black_flag: ${ user.link() } took ${ car.info() } outside of the driving zone. ${ booking.link() }`, [ 'slack' ], { channel : '#rental-alerts' });
      }
    }
  }

  // Check charge level
  // See Api: Low charge text message triggers #495 & #961
  if (car.milesAvailable() < 7 && !booking.isFlagged('low-2')) {
    yield booking.flag('low-2');
    yield notify.sendTextMessage(user, "Hi, you're WaiveCar is getting dangerously low on charge! If it runs out of juice, we'll have to tow it at your expense! Please call us at this number and we'll direct you to the nearest charger.");
    yield notify.notifyAdmins(`:interrobang: ${ user.link() } is persisting and is now disastrously low with ${ car.info() }, oh dear. ${ car.chargeReport() }. ${ booking.link() }`, [ 'slack' ], { channel : '#rental-alerts' });

  } else if (car.milesAvailable() < 14 && !booking.isFlagged('low-1')) {
    yield booking.flag('low-1');
    yield notify.sendTextMessage(user, "Hi, you're WaiveCar is getting really low. Please call us and we can help you get to a charger.");
    yield notify.notifyAdmins(`:small_red_triangle: ${ user.link() } is continuing to drive ${ car.info() } to an even lower charge. ${ car.chargeReport() }. ${ booking.link() }`, [ 'slack' ], { channel : '#rental-alerts' });

  } else if (car.milesAvailable() < 21 && !booking.isFlagged('low-0')) {
    yield booking.flag('low-0');
    yield notify.sendTextMessage(user, config.notification.reasons['LOW_CHARGE']);
    yield notify.notifyAdmins(`:battery: ${ user.link() } has driven ${ car.info() } to a low charge. ${ car.chargeReport() }. ${ booking.link() }`, [ 'slack' ], { channel : '#rental-alerts' });
  }

  // Log position
  let location = new Location({
    bookingId : booking.id,
    latitude  : car.latitude,
    longitude : car.longitude,
    hdop: car.hdop
  });
  yield location.save();

  yield cars.syncUpdate(car.id, device, car);
});

scheduler.process('active-booking', function *(job) {
  log.info('ActiveBooking : start ');
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
      if (yield redis.shouldProcess('booking-loop', booking.id, 90 * 1000)) {
        checkBooking(booking);
      }
    } catch(err) {
      log.warn(`ActiveBooking : failed to handle booking ${ booking.id } : ${ err } (${ err.stack })`);
    }
  }
});
