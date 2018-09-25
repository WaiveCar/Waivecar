'use strict';
let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');
let bookingService = require('../../lib/booking-service.js');

scheduler.process('have-cars-moved', function *(job) {
  console.log('have cars moved process');
  console.log('job.data: ', job.data);
  
  let carsForNextCheck = !job.data.carsForNextCheck ? {} : job.data.carsForNextCheck;

  let cars = yield Car.find({
    where: {
      inRepair: false,
    }
  });

  for (let car of cars) {
    if (yield bookingService.isAtHub(car)) {
      console.log('car is at hub');
    } else {
      console.log('car not at hub');
    }
  }
});

module.exports = function*() {
  let timerObj = {value: 15, type: 'seconds'};
  scheduler.add('have-cars-moved', {
    init: true,
    timer: timerObj, 
    data: {},
  });
};
