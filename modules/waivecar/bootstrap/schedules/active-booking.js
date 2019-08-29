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
let GeocodingService = require('../../lib/geocoding-service');
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



var checkBooking = co.wrap(function *(booking) {
  try {
    let details = yield BookingDetails.find({ where : { bookingId : booking.id } });
    let start = _.find(details, { type : 'start' });

    if(!booking.car) {
      booking.car = yield Car.findById(booking.carId);
    }
    if(!booking.car) {
      log.warn("can't find car with id " + booking.carId);
      return;
    }

    let car = booking.car;
    let device = yield cars.getDevice(car.id, null, 'booking-loop');
    let user = booking.user;
    let duration = 0;
    let isLevel = yield car.hasTag('level');
    let isCsula = yield car.hasTag('csula');
    let booking_history = null;
    let freetime = booking.getFreeTime(isLevel);
    let trigger = freetime + 60;
    
    // This increments the sitCount if it seems the car has been sitting since the last check
    if (booking.car.isIgnitionOn === false && !booking.car.license.match(/work/i)) {
      // console.log("Checking for booking " + booking.car.license);
      let sitStart = +(yield redis.hget('sitStart', booking.id));
      let now = +new Date();
      let duration_min = 30;
      let duration_ms = duration_min * 60 * 1000;
      if(!sitStart) {
        // console.log("No sit time for booking " + booking.car.license);
        yield redis.hset('sitStart', booking.id, now);
        yield redis.hset('sitLast', booking.id, now);
      } else {
        let sitLast = +(yield redis.hget('sitLast', booking.id));
        if(now - sitLast > duration_ms) {
          let minute_count = Math.floor((now - sitStart) / duration_ms) * duration_min;
          console.log(`${booking.car.license} has been parked for ${minute_count} minutes and is still active. This courtesy message is brought to you to help save you money.`);
          /*
          yield notify.sendTextMessage(booking.user, 
            `${booking.car.license} has been parked for ${minute_count} minutes and is still active. This courtesy message is brought to you to help save you money.`
          );
          */
          yield redis.hset('sitLast', booking.id, now);
        }
      }
    } else {
      // The booking is deleted from the object if the ignition is on
      yield redis.hdel('sitStart', booking.id);
      yield redis.hdel('sitLast', booking.id);
    }

    if(device) {
      // This section increments drive_count, park_count and charge_count 
      let bookingRecord = yield Booking.findById(booking.id);
      if (device.isIgnitionOn) {
        // If the ignition is on, drive_count is incremented
        yield bookingRecord.update({ driveCount: bookingRecord.driveCount + 1 });
      } else {
        // If it is off, park_count is incremented
        yield bookingRecord.update({ parkCount: bookingRecord.parkCount + 1 });
      } 
      if (device.isCharging) {
        // If the car is charging charge_count is incremented
        yield bookingRecord.update({ chargeCount: bookingRecord.chargeCount + 1 });
      }
    } else {
      // if we failed to fetch the device we just pretend and move on
      device = car;
    }

    if (start) {
      if (!booking.isFlagged('drove') ) {
        if (device.isIgnitionOn || car.mileage !== device.mileage || device.calculatedSpeed > 0 || device.currentSpeed > 0 || !device.isParked) {
          yield booking.flag('drove');
          if (!booking.isFlagged('first-sync')) {
            yield booking.delForfeitureTimers();
          }
        } else if (!booking.isFlagged('first-sync') && !booking.isFlagged('rush')) {
          // When a Waivwork user is booked into a car, we don't want their booking to autoforfeit
          if (!booking.isFlagged('Waivework')) {
            yield booking.setForfeitureTimers(user, config.waivecar.booking.timers);
          }
          // we don't want to send off anything to the user
          // unless we've checked the car
          yield booking.flag('first-sync');
        }
      }

      // Check that battery use is changing as expected
      /*
      let milesDriven = (car.totalMileage - start.mileage) * 0.621371;
      if (milesDriven >= 7 && car.charge === device.charge) {
        yield notify.notifyAdmins(`${ car.info() } has been driven ${ milesDriven } miles since last change reported, but charge level has not changed. ${ config.api.uri }/cars/${ car.id }`, [ 'slack' ], { channel : '#rental-alerts' });
      }
      */

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
        //
        // if (duration >= (freetime - 16) && !booking.isFlagged('1hr45-warning')) {
        //  yield booking.flag('1hr45-warning');
        //  yield notify.sendTextMessage(user, 'Hi there, your free WaiveCar rental period ends in about 15 minutes. After the free period is over, rentals are $5.99 / hour. Enjoy!');
        // }

        if (duration >= 11 * 60 && !booking.isFlagged('rush') && !booking.isFlagged('11h-warning')) {
          yield booking.flag('11h-warning');
          yield notify.notifyAdmins(`:waning_crescent_moon: ${ user.link() } has had ${ car.link() } for 11 hours`, [ 'slack' ], { channel : '#rental-alerts' });
          yield notify.sendTextMessage(user, 'Hey there, Waive has a 12 hour rental limit. Please end your rental in the next hour. Thanks!');
        }
        
        // This text message warning if the booking is 1 hour over the free time
        if (duration >= trigger && !booking.isFlagged('rush') && !booking.isFlagged('hour-over-notice')) {
          yield booking.flag('hour-over-notice');
          let hour = Math.floor(trigger / 60);
          yield notify.sendTextMessage(user, `Just a reminder that you are ${ hour } hours into your booking with ${ car.license }. If you feel this is a mistake, give us a call. Otherwise enjoy your ride!`);
        }
      }

      //
      // New user rental warning (under 5 rentals, over 3 hours) #463
      //
      // Send an alert to 'rental alerts' if a new user (less than 5 trips) has taken a car for longer than 3 hours. 
      //
      if (duration >= trigger && !booking.isFlagged('new-user-long-rental')) {
        let newUserCutoff = 5;
        booking_history = yield Booking.find({ 
          where : { userId : user.id },
          limit : newUserCutoff + 2
        });

        if(booking_history.length < newUserCutoff) {
          yield booking.flag('new-user-long-rental');
          yield notify.notifyAdmins(`:cactus: ${ user.link() } drove ${ car.link() } ${ duration } minutes and has only rented ${ booking_history.length } times.`, [ 'slack' ], { channel : '#rental-alerts' });
        }
      }
    }

    if (device.boardVoltage < 11.1) {
      if (!booking.isFlagged('low-12v-battery')) {
        yield booking.addFlag('low-12v-battery');
        yield notify.sendTextMessage(user,
          `It looks like the battery on ${car.license} is dropping. If it gets too low it won't be able to start without a jump. Please check to make sure things like the lights, stereo, and climate control are off. Thanks.`
        );
      } 
    }

    if (!user.isWaivework) {
      // A cheap way to do csula check ... we just expand the santa monica zone.
      let deviceInside = GeocodingService.inDrivingZone(car, isCsula ? 1.5 : 1);

      // if we thought we were outside but now we're inside
      if (deviceInside && booking.isFlagged('outside-range')) {
        yield booking.unFlag('outside-range');
        yield notify.notifyAdmins(`:waving_white_flag: ${ user.link() } took ${ car.info() } back into the driving zone. ${ booking.link() }`, [ 'slack' ], { channel : '#rental-alerts' });

      // if we thought we were inside but now we are outside.
      } else if (!deviceInside && !booking.isFlagged('outside-range')) {
        if(!isLevel) {
          let homebase = (isCsula && 'at the CSULA campus') || 'in the green zone on the map';
          yield booking.flag('outside-range');
          yield notify.sendTextMessage(user, `Hi there, looks like you are driving your WaiveCar outside of our range. As a reminder, all rentals must be completed ${ homebase }. Thanks & enjoy your drive!`);
          yield notify.notifyAdmins(`:waving_black_flag: ${ user.link() } took ${ car.info() } outside of the driving zone. ${ booking.link() }`, [ 'slack' ], { channel : '#rental-alerts' });
        }
      }
    }
 
    // Check charge level
    // See Api: Low charge text message triggers #495 & #961
    // See #1455 for the csula related numbers.
    let lowList = isCsula ? [ 45, 30, 15 ] : [ 21, 14, 7 ];

    if (car.license.search(/work/i) === -1) {
      if (car.avgMilesAvailable() < lowList[0] && !booking.isFlagged('low0')) {
        let homebase = (isLevel && '34 N 7th Street') || (isCsula && 'the CSULA campus') || '2102 Pico Blvd, Santa Monica 90405';

        yield booking.flag('low0');
        yield notify.sendTextMessage(user, `Hey there! Looks like your WaiveCar is getting really low. Please return your WaiveCar to ${ homebase }.`);
        yield notify.notifyAdmins(`:battery: ${ user.link() } has driven ${ car.info() } to a low charge. ${ car.chargeReport() }. ${ booking.link() }`, [ 'slack' ], { channel : '#rental-alerts' });
      } else if (car.avgMilesAvailable() < lowList[1] && !booking.isFlagged('low1')) {
        yield booking.flag('low1');
        yield notify.sendTextMessage(user, "Hi, your WaiveCar is getting really low. Please call us and we can help you get to a station.");
        yield notify.notifyAdmins(`:small_red_triangle: ${ user.link() } is continuing to drive ${ car.info() } to an even lower charge. ${ car.chargeReport() }. ${ booking.link() }`, [ 'slack' ], { channel : '#rental-alerts' });
      } else if (car.avgMilesAvailable() < lowList[2] && !booking.isFlagged('low2')) {
        yield booking.flag('low2');
        yield notify.sendTextMessage(user, "Hi, your WaiveCar is getting dangerously low! If it runs out of juice, we'll have to tow it at your expense! Please call us at this number and we'll direct you to the nearest station.");
        yield notify.notifyAdmins(`:interrobang: ${ user.link() } is persisting and is now disastrously low with ${ car.info() }, oh dear. ${ car.chargeReport() }. ${ booking.link() }`, [ 'slack' ], { channel : '#rental-alerts' });
      }
    }

    // Log current position
    let newLocation = new Location({
      bookingId : booking.id,
      latitude  : device.latitude,
      longitude : device.longitude
    });
    yield newLocation.save();
    
    /*
    let hasMoved = GeocodingService.hasMoved(car, device, 600);
    // If the car has moved, but the ignition is off, that means that the vehicle may currently be being towed and a notification is sent tto slack
    if (hasMoved && !device.isIgnitionOn && !car.isIgnitionOn && car.totalMileage === device.totalMileage && hasMoved < 20000) {
      console.log(car, device, car.totalMileage, device.totalMileage, device.isIgnitionOn, car.isIgnitionOn, hasMoved);
      yield notify.notifyAdmins(`:flying_saucer: ${ car.license } is moving without the ignition on or odometer incrementing. It may be on a tow truck.`, [ 'slack' ], { channel : '#rental-alerts' });
    }
    */

    yield cars.syncUpdate(car.id, device, car);
  } catch(err) {
    log.warn(`ActiveBooking : failed to handle booking ${ booking.id } : ${ err } (${ err.stack })`);
  }
});

scheduler.process('active-booking', function *(job) {
  log.info('ActiveBooking : start ');
  // This is the object that is used to store the number of increments of active booking that a car 
  // has had its ignition off for
  let sitCountList = (yield redis.hkeys('sitStart')).concat(yield redis.hkeys('sitLast'));

  let bookings = yield Booking.find({ 
    where : { 
      status : 'started', 
    }, 
    include: [{
      model: 'Car',
      as: 'car',
    }, {
      model: 'User',
      as: 'user',
    }]
  });
  // This is for removing completed bookings from the sitCounts object once they 
  // no longer need to be in it
  let bookingIds = new Set(bookings.map(booking => booking.id));
  for (let id in sitCountList) {
    if (!bookingIds.has(Number(id))) {
      yield redis.hdel('sitLast', id);
      yield redis.hdel('sitStart', id);
    }
  }

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
