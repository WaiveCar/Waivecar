'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');
var moment = require('moment-timezone');
let relay = Bento.Relay;

scheduler.process('make-cars-unavailable', function*(job) {
  let carsToProcess = yield Car.find({where: {isAvailable: true}});
  carsToProcess.forEach(car => {
    car.isAvailable = false;
    car.relay('update');
  });

  let timerObj = {value: 24, type: 'hours'};
  scheduler.add('make-cars-unavailable', {
    timer: timerObj,
  });
});

module.exports = function*() {
  let currentHour = Number(
    moment()
      .tz('America/Los_Angeles')
      .format('H'),
  );
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

  let secondsUntilTime = Math.abs(moment().diff(timeToCheck, 'seconds'));

  let timerObj = {value: secondsUntilTime, type: 'seconds'};
  scheduler.add('make-cars-unavailable', {
    timer: timerObj,
  });
};
