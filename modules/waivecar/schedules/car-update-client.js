'use strict';

let scheduler   = Reach.service('queue').scheduler;
let Car         = Reach.model('Car');
let CarLocation = Reach.model('CarLocation');
let io          = Reach.IO;

module.exports = function *() {
  scheduler.add('car-update-client', {
    init   : true,
    repeat : true,
    timer  : {
      value : 5,
      type  : 'minutes'
    }
  });
};

// ### Car Update Client
// Pushes car data to clients every x minutes, GM-API will be updating
// our databases in random intervals where we collect the data and
// push a complete list of cars back to the client independent of any
// external API's to lessen the complication of transactions.

scheduler.process('car-update-client', function *(job) {
  let cars = yield Car.find();
  if (!cars) {
    return;
  }
  yield cars.hasOne(CarLocation, 'carId', 'location', [ 'latitude', 'longitude' ]);
  io.flux({
    actionType : 'cars:update',
    cars       : cars
  });
});