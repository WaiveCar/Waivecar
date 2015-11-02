'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Car       = Bento.model('Car');
let log       = Bento.Log;

module.exports = function *() {
  scheduler.add('car-reconcile-fleet', {
    init   : true,
    repeat : true,
    timer  : {
      value : 30,
      type  : 'minutes'
    }
  });
};

// ### Car Reconcile Fleet
// Pulls down fleet data from the GM API and upserts it into the local database.
// This is done to ensure faster responses to client applications from our API.
// NOTE! On a live build this job should run once or twice a day.

/*
scheduler.process('car-reconcile-fleet', function *(job) {
  log.info('Reconciling Car Fleet');
  let vehicles = yield service.listVehicles();
  log.debug(vehicles.length + ' cars to be reconciled.');
  for (let i = 0, len = vehicles.length; i < len; i++) {
    vehicles[i].id = vehicles[i].vin;
    let car = new Car(vehicles[i]);
    yield car.upsert();
  }
});
*/