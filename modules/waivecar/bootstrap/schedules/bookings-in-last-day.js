'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');
let User = Bento.model('User');
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

  let carsIx = 0;
  let output = [];
  let locHash = {};
  carsToCheck.sort(function(a, b) { return a.latitude - b.latitude + (a.longitude - b.longitude) } ); 
  for (let car of carsToCheck) {
    if (car.bookings.length) {
      let lastBooking = new Date() - car.bookings[0].createdAt;
      if( (car.license.search(/(csula|waive)/i) !== -1 && lastBooking / 1000 / 24 / 60 / 60 > 0.8) || 
          (car.license.search(/work/i) !== -1 && car.inRepair)
        ) { 
        let key = (car.latitude).toFixed(2) + (car.longitude).toFixed(2);
        if(!locHash[key]) {
          locHash[key] = [];
        }
        locHash[key].push(car);
        carsIx++;
      }
    }
  }

  for (let key in locHash) {
    let carList = locHash[key];
    let header = (yield geocodeService.getAddress(
      carList[0].latitude,
      carList[0].longitude,
    ));
    if(header) {
      header = header.replace(/, (CA|NY|USA)/g,'');
    } else {
      header = `${carList[0].latitude}, ${carList[0].longitude}`;
    }
    let row = [[]];
    
    for(let car of carList) {
      let lastBooking = Math.round((new Date() - car.bookings[0].createdAt) / 1000 / 24 / 60 / 60);
      let weeks = Math.round(lastBooking / 7);
      let warn = car.isAvailable ? "AVAILABLE" : (!car.inRepair ? "" : (car.repairReason || "(reason unknown) "));
      if(car.userId) {
        let user = yield User.findById(car.userId);
        warn += user.name() + " ";
      }
      let msg = `${car.license} ${lastBooking}d ${warn} `;
      if(weeks > 1) {
        msg = msg.trim();
        msg += `(${weeks}w)`
      }
      row.push(msg);
    }
    output.push(`*${header}*` + row.join("\n… "));
  }
  output = `_${carsIx} / ${carsToCheck.length} ${Math.round(100 * carsIx / carsToCheck.length)}% not booked in last day_\n` + output.join("\n\n");
  yield notify.notifyAdmins( output, ['slack'], {channel: '#fleet'});

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
          .hours(10)
          .minutes(0)
          .seconds(0)
      : moment()
          .tz('America/Los_Angeles')
          .add(1, 'days')
          .hours(10)
          .minutes(0)
          .seconds(0);
  // This gets the seconds until the cars are to be marked unavailable
  let secondsUntilTime = Math.abs(moment().diff(timeToCheck, 'seconds'));
  let timerObj = {value: secondsUntilTime, type: 'seconds'};

  scheduler.add('bookings-in-last-day', {
    timer: timerObj,
  });
};
