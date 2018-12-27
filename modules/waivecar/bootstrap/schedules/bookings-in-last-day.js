'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');
let moment = require('moment-timezone');
let notify = require('../../lib/notification-service');
let geocodeService = require('../../lib/geocoding-service');
let redis     = require('../../lib/redis-service');

function *showBookings() {
  if (!(yield redis.shouldProcess('bookings-in-last-day', (new Date()).getDay(), 90 * 1000))) {
    return;
  }
  // This queries for all cars and their bookings from the last 24 hours
  let carsToCheck = yield Car.find({
    include: [
      {
        model: 'Booking',
        as: 'bookings',
        required: false,
        limit: 1,
        order: [['created_at','desc']],
      },
    ],
  });

  let output = [];
  let locHash = {};
  carsToCheck.sort(function(a, b) { return a.latitude - b.latitude + (a.longitude - b.longitude) } ); 
  for (let car of carsToCheck) {
    if (car.license.search(/work/i) === -1 && car.bookings.length) {
      let lastBooking = new Date() - car.bookings[0].createdAt;
      if(lastBooking / 1000 / 24 / 60 / 60 > 0.8) { 
        let key = (2*car.latitude).toFixed(2) + (2*car.longitude).toFixed(2);
        if(!locHash[key]) {
          locHash[key] = [];
        }
        locHash[key].push(car);
      }
    }
  }

  for (let key in locHash) {
    let carList = locHash[key];
    let header = yield geocodeService.getAddress(
      carList[0].latitude,
      carList[0].longitude,
    );
    let row = [[]];
    
    for(let car of carList) {
      let lastBooking = Math.round((new Date() - car.bookings[0].createdAt) / 1000 / 24 / 60 / 60);
      let warn = car.isAvailable ? " AVAILABLE" : (!car.inRepair ? " NOT IN REPAIR" : "");
      row.push(`${car.license} (${car.averageCharge()}%${warn}) last booked ${lastBooking}d ago`);
    }
    output.push(`*${header}*` + row.join("\n… "));
  }
  yield notify.notifyAdmins(
    ':sleeping_accommodation: ' + output.join("\n\n"),
    ['slack'],
    {channel: '#rental-alerts'},
  );

  scheduler.add('bookings-in-last-day', {
    timer: {
      value: 24,
      type: 'hours',
    },
  });
}

scheduler.process('bookings-in-last-day', function*(job) {
  yield showBookings();
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
  yield showBookings();
  scheduler.add('bookings-in-last-day', {
    timer: timerObj,
  });
};
