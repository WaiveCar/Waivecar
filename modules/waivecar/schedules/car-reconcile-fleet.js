'use strict';

let scheduler      = Reach.service('queue').scheduler;
let VehicleService = Reach.service('gm-api/vehicle-service');
let Car            = Reach.model('Car');
let log            = Reach.Log;
let service        = new VehicleService();

module.exports = function *() {
  scheduler.add('car-reconcile-fleet', {
    init   : true,
    repeat : true,
    timer  : {
      value : 6,
      type  : 'hours'
    }
  });
};

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