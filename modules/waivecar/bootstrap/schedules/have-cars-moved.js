'use strict';
let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');
let bookingService = require('../../lib/booking-service');
let notify = require('../../lib/notification-service');
let geocodeService = require('../../lib/geocoding-service');

let timerSettings = {
  value: 15,
  type: 'seconds',
};

scheduler.process('have-cars-moved', function*(job) {
  let carsForNextCheck = !job.data.carsForNextCheck
    ? {}
    : job.data.carsForNextCheck;
  let cars = yield Car.find({
    where: {
      inRepair: false,
      isWaivework: false,
    },
  });
  console.log(carsForNextCheck);

  for (let car of cars) {
    if (!(yield bookingService.isAtHub(car))) {
      if (!carsForNextCheck[car.license]) {
        let toStore = {
          latitude: car.latitude,
          longitude: car.longitude,
          timeSitting: 0,
          address: yield geocodeService.getAddress(car.latitude, car.longitude), 
        };
        //let address = yield geocodeService.getAddress(car.latitude, car.longitude); 
        carsForNextCheck[car.license] = toStore;
      } else if (
        carsForNextCheck[car.license].latitude === car.latitude &&
        carsForNextCheck[car.license].longitude === car.longitude
      ) {
        carsForNextCheck[car.license].timeSitting += timerSettings.value;
        yield notify.notifyAdmins(
          ':fishing_pole_and_fish: a message',
          ['slack'],
          {channel: '#rental-alerts'},
        );
      } else {
        delete carsForNextCheck[car.license];
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
