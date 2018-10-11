'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');
var moment = require('moment-timezone');
let relay = Bento.Relay;

scheduler.process('make-cars-unavailable', function*(job) {
  let carsToProcess = yield Car.find({
    where: {
      isAvailable: true, 
      charge: { $gt : 35 } 
    }
  });
  carsToProcess.forEach(car => {
    // This sets the car as unavailable so that the unavailable car is relayed. This is so that
    // they disappear from users' maps without actually becoming marked unavailable in the database.
    car.isAvailable = false;
    car.relay('update');
  });

  let timerObj = {value: 24, type: 'hours'};
  scheduler.add('make-cars-unavailable', {
    timer: timerObj,
  });
});

module.exports = function*() {
  // This gets the hour of the current time
  let currentHour = Number(
    moment()
      .tz('America/Los_Angeles')
      .format('H'),
  );
  // This is the time that cars are to be made unavailable. If it is after 1:00, a day will be added
  // to the time to update the cars 
  let timeToCheck =
    currentHour < 1
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

  let timerObj = {value: secondsUntilTime, type: 'seconds'};
  scheduler.add('make-cars-unavailable', {
    timer: timerObj,
  });
};
