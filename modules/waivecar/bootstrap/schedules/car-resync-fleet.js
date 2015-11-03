'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Car       = Bento.model('Car');
let log       = Bento.Log;
let service   = require('../../lib/car-service');

module.exports = function *() {
  scheduler.add('car-resync-fleet', {
    init   : true,
    repeat : true,
    timer  : {
      value : 5,
      type  : 'days'
    }
  });
};

// ### Car Reconcile Fleet
// Resync fleet listing from Invers and upsert it into the local database.
// This is done to ensure all active cars are known to the local API.

scheduler.process('car-resync-fleet', function *(job) {
  log.info('Resyncing Fleet');
  let cars = yield service.listDevices();
  log.debug(`${ cars.length } cars to be upserted.`);
  for (let i = 0, len = cars.length; i < len; i++) {
    let car = new Car(cars[i]);
    yield car.upsert();
  }
});
