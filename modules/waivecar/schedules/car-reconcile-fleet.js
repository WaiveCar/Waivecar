'use strict';

let co             = require('co');
let queue          = Reach.service('queue');
let log            = Reach.Log;
let VehicleService = Reach.service('gm-api/vehicle-service');
let Car            = Reach.model('Car');
let service        = new VehicleService();

module.exports = function *() {
  yield queue.scheduler.add('car-reconcile-fleet', {
    init   : true,
    repeat : true,
    timer  : {
      value : 1,
      type  : 'hour'
    }
  });
};

queue.process('car-reconcile-fleet', function (job, done) {
  log.info('Reconciling Car Fleet');
  co(function *() {
    let vehicles = yield service.listVehicles();
    log.debug(vehicles.length + ' cars to be reconciled.');
    for (let i = 0, len = vehicles.length; i < len; i++) {
      vehicles[i].id = vehicles[i].vin;
      let car = new Car(vehicles[i]);
      yield car.upsert();
    }
    done();
  });
});