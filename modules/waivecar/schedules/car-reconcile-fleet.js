'use strict';

let co             = require('co');
let moment         = require('moment');
let queue          = Reach.service('queue');
let schedule       = Reach.service('queue/scheduler');
let VehicleService = Reach.service('gm-api/vehicle-service');
let Car            = Reach.model('Car');
let log            = Reach.Log;
let service        = new VehicleService();

// ### The Job

let jobSchedule = queue
  .create('car-reconcile-fleet', {
    message : 'Hello World'
  })
;

// ### Schedule Job

jobSchedule.save();

// ### Job Process

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

    schedule(jobSchedule, moment().add(1, 'hour'));
    done();
  });
});