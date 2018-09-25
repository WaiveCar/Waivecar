'use strict';
let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');
let bookingService = require('../../lib/booking-service.js');
let timerSettings = {
  value: 15,
  type: 'seconds',
  incrementTime: 3,
  incrementUnit: 'hours',
};

scheduler.process('have-cars-moved', function*(job) {
  console.log('running process');
  let carsForNextCheck = !job.data.carsForNextCheck
    ? {}
    : job.data.carsForNextCheck;
  let cars = yield Car.find({
    where: {
      inRepair: false,
      isWaivework: false,
    },
  });

  for (let car of cars) {
    if (!(yield bookingService.isAtHub(car))) {
      if (!carsForNextCheck[car.license]) {
        let toStore = {
          latitude: car.latitude,
          longitude: car.longitude,
          hoursSitting: 0,
        };
        carsForNextCheck[car.license] = toStore;
      } else if (
        carsForNextCheck[car.license].latitude === car.latitude &&
        carsForNextCheck[car.license].longitude === car.longitude
      ) {
        //carsForNextCheck[car.license].hoursSitting += incrementTime;
        //notify slack
      }
    }
  }
  scheduler.add('have-cars-moved', {
    timer: timerSettings,
    data: {carsForNextCheck},
  });
});

module.exports = function*() {
  //scheduler.cancel('have-cars-moved');
  scheduler.add('have-cars-moved', {
    init: true,
    timer: timerSettings,
    data: {},
  });
};
