'use strict';

let scheduler     = Reach.service('queue').scheduler;
let Car           = Reach.model('Car');
let CarDiagnostic = Reach.model('CarDiagnostic');
let log           = Reach.Log;

let diagnosticItems = [
  'evBatteryLevel',
  'evChargeState',
  // 'priorityChargeStatus',
  // 'estChgEnd120V',
  // 'estChgEnd240V',
  // 'estChgEnd400V',
  // 'fuelAmount',
  // 'fuelCapacity',
  // 'fuelLevel',
  // 'fuelLevelInGal',
  'odometer',
  // 'oilLife',
  // 'tirePressureLf',
  // 'tirePressureLr',
  // 'tirePressurePlacardFront',
  // 'tirePressurePlacardRear',
  // 'tirePressureRf',
  // 'tirePressureRr',
  'evRange',
  'totalRange'
];

module.exports = function *() {
  scheduler.add('car-reconcile-diagnostics', {
    init   : true,
    repeat : true,
    silent : true,
    timer  : {
      value : 30,
      type  : 'seconds'
    }
  });
};

// ### Car Reconcile Diagnostic
// Loops through available cars in the database and updates their diagnostics randomly.
// This is a mock job to simulate GM data.

scheduler.process('car-reconcile-diagnostics', function *(job) {
  let cars = yield Car.find({
    include : [
      {
        model : 'CarDiagnostic',
        as    : 'diagnostics'
      }
    ]
  });
  if (!cars) {
    return;
  }

  for (let i = 0, len = cars.length; i < len; i++) {
    let car = cars[i];

    if (car.diagnostics.length === 0) {
      for (let d = 0, len = diagnosticItems.length; d < len; d++) {
        let newDiagnostic = new CarDiagnostic({
          carId   : car.id,
          type    : diagnosticItems[d],
          status  : 'active',
          message : 'NA',
          value   : '10',
          unit    : '90'
        });
        yield newDiagnostic.upsert();
      }
    } else {
      for (let d = 0, len = car.diagnostics.length; d < len; d++) {
        let previousDiagnostic = car.diagnostics[d];
        let diagnostic = new CarDiagnostic({
          id      : previousDiagnostic.id,
          carId   : car.id,
          type    : previousDiagnostic.type,
          status  : previousDiagnostic.status,
          message : previousDiagnostic.message,
          value   : previousDiagnostic.value,
          unit    : (parseInt(previousDiagnostic.unit) + 1).toString()
        });
        yield diagnostic.upsert();
      }
    }
  }
});
