'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');
let moment = require('moment');

scheduler.process('bookings-in-last-day', function*(job) {
  console.log('bookings in last day');
  try {
    let cars = yield Car.find({
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
    console.log('cars: ', cars);
  } catch (e) {
    console.log('error: ', e);
  }

  scheduler.add('bookings-in-last-day', {
    timer: {
      value: 24,
      type: 'seconds',
    },
  });
});

module.exports = function*() {
  //scheduler.cancel('bookings-in-last-day');
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
          .hours(1)
          .minutes(0)
          .seconds(0)
      : moment()
          .tz('America/Los_Angeles')
          .add(1, 'days')
          .hours(1)
          .minutes(0)
          .seconds(0);
  // This gets the seconds until the cars are to be marked unavailable
  let secondsUntilTime = Math.abs(moment().diff(timeToCheck, 'seconds'));
  let timerObj = {value: 10, type: 'seconds'};
  scheduler.add('bookings-in-last-day', {
    timer: timerObj,
  });
};
