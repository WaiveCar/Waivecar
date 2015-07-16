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
  .create('vehicle-reconcile-fleet', {
    message : 'Hello World'
  })
;

// ### Schedule Job

jobSchedule.save();

// ### Job Process

queue.process('vehicle-reconcile-fleet', function (job, done) {
  log.info('Reconciling Vehicle Fleet');
  co(function *() {
    let vehicles = yield service.listVehicles();

    for (let i = 0, len = vehicles.length; i < len; i++) {
      let car = new Car(vehicles[i]);
      yield car.upsert();
    }

    schedule(jobSchedule, moment().add(1, 'hour'));
    done();
  });
});