'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');
let moment = require('moment-timezone');
let notify = require('../../lib/notification-service');
let geocodeService = require('../../lib/geocoding-service');
let redis     = require('../../lib/redis-service');

scheduler.process('bookings-in-last-day', function*(job) {
  if (!yield redis.shouldProcess('bookings-in-last-day', (new Date()).getDay(), 90 * 1000)) {
    return;
  }
  // This queries for all cars and their bookings from the last 24 hours
  let carsToCheck = yield Car.find({
    where: {
      isWaivework: false,
      inRepair: false,
    },
    include: [
      {
        model: 'Booking',
        as: 'bookings',
        required: false,
        where: {
          createdAt: {
            $gt: moment().subtract(1, 'days'),
          },
        },
      },
    ],
  });

  for (let car of carsToCheck) {
    if (car.bookings.length === 0) {
      // If there are no bookings from the last 24 hours, the address of the car is
      // found and the slack notification is sent out
      let address = yield geocodeService.getAddress(
        car.latitude,
        car.longitude,
      );
      yield notify.notifyAdmins(
        `:sleeping_accommodation: ${
          car.license
        } has not been booked in the last 24 hours. It is currently at ${address}`,
        ['slack'],
        {channel: '#rental-alerts'},
      );
    }
  }

  scheduler.add('bookings-in-last-day', {
    timer: {
      value: 24,
      type: 'hours',
    },
  });
});

module.exports = function*() {
  // This gets the hour of the current time
  let currentHour = Number(
    moment()
      .tz('America/Los_Angeles')
      .format('H'),
  );
  // This is the time that cars are to be checked for bookings in the last 24 hours
  // If it is after 10:00PM, a day will be added to the time to update the cars
  let timeToCheck =
    currentHour < 22
      ? moment()
          .tz('America/Los_Angeles')
          .hours(22)
          .minutes(0)
          .seconds(0)
      : moment()
          .tz('America/Los_Angeles')
          .add(1, 'days')
          .hours(22)
          .minutes(0)
          .seconds(0);
  // This gets the seconds until the cars are to be marked unavailable
  let secondsUntilTime = Math.abs(moment().diff(timeToCheck, 'seconds'));
  let timerObj = {value: secondsUntilTime, type: 'seconds'};
  scheduler.add('bookings-in-last-day', {
    timer: timerObj,
  });
};
