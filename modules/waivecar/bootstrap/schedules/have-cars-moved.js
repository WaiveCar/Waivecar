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
  // If there are no cars already being passed to this process, a new object is used
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
    // Cars are added to/updated in the object if they are not at home
    if (!(yield bookingService.isAtHub(car))) {
      if (!carsForNextCheck[car.license]) {
        // If the car is not already in the object of cars to check and it is not at a hub,
        // it is added to the object
        carsForNextCheck[car.license] = {
          latitude: car.latitude,
          longitude: car.longitude,
          timeSitting: 0,
          address: yield geocodeService.getAddress(car.latitude, car.longitude),
        };
      } else if (
        carsForNextCheck[car.license].latitude === car.latitude &&
        carsForNextCheck[car.license].longitude === car.longitude
      ) {
        // If the car is already in the object and has not moved, its time is incremented and 
        // a slack notification is sent out
        carsForNextCheck[car.license].timeSitting += timerSettings.value;
        yield notify.notifyAdmins(
          `:fishing_pole_and_fish: ${car.license} has been sitting for ${
            carsForNextCheck[car.license].timeSitting
          } ${timerSettings.type} at ${carsForNextCheck[car.license].address}`,
          ['slack'],
          {channel: '#rental-alerts'},
        );
      } else {
        // If the car has moved, it is deleted from the object
        delete carsForNextCheck[car.license];
      }
    } else {
      // The car is removed from the object if it is at home base
      if (carsForNextCheck[car.license]) {
        delete carsForNextCheck[car.license];
      }
    }
  }
  console.log(carsForNextCheck);
  scheduler.add('have-cars-moved', {
    timer: timerSettings,
    data: {carsForNextCheck},
  });
});

module.exports = function*() {
  scheduler.add('have-cars-moved', {
    init: true,
    timer: timerSettings,
    data: {},
  });
};
