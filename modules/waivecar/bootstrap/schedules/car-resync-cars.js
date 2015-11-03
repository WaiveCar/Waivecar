'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Car       = Bento.model('Car');
let log       = Bento.Log;
let service   = require('../../lib/car-service');

module.exports = function *() {
  scheduler.add('car-resync-cars', {
    init   : true,
    repeat : true,
    timer  : {
      value : 10,
      type  : 'minutes'
    }
  });
};

// Resync each car's record from Invers.
scheduler.process('car-resync-cars', function *(job) {
  log.info('Resyncing Cars');
  let cars = yield Car.find();
  if (!cars) {
    return;
  }
  log.debug(`${ cars.length } cars to be resynced.`);
  for (let i = 0, len = cars.length; i < len; i++) {
    let car    = cars[i];
    let updatedCar = yield service.device(car.id);
    yield car.update(updatedCar);
  }

});
