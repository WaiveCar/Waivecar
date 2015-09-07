'use strict';

let scheduler       = Reach.service('queue').scheduler;
let Car             = Reach.model('Car');
let CarDiagnostic   = Reach.model('CarDiagnostic');
let log             = Reach.Log;
let maxRange        = 37;
let maxPercent      = 100;
let minPercent      = 10;
let diagnosticItems = [
  'evBatteryLevel', // %
  'evChargeState', // 'Complete'
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
      value : 5,
      type  : 'minutes'
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
  log.debug('Reconciling Diagnostics for ' + cars.length + ' Cars');
  for (let i = 0, len = cars.length; i < len; i++) {
    let car = cars[i];

    if (car.diagnostics.length === 0) {
      for (let d = 0, len = diagnosticItems.length; d < len; d++) {
        let newDiagnostic = new CarDiagnostic({
          carId   : car.id,
          type    : diagnosticItems[d],
          status  : 'active',
          message : 'NA',
          value   : maxPercent.toString(),
          unit    : '%'
        });

        if ([ 'evRange', 'totalRange', 'odometer' ].indexOf(diagnosticItems[d]) > -1) {
          newDiagnostic.value = maxRange.toString();
          newDiagnostic.unit = 'Mi';
        } else if (diagnosticItems[d] === 'evChargeState') {
          newDiagnostic.value = 'Complete';
          newDiagnostic.unit = 'Text';
        }

        yield newDiagnostic.upsert();
      }
    } else {

      let evBatteryLevel = new CarDiagnostic(car.diagnostics.find(d => d.type === 'evBatteryLevel'));
      let evChargeState  = new CarDiagnostic(car.diagnostics.find(d => d.type === 'evChargeState'));
      let evRange        = new CarDiagnostic(car.diagnostics.find(d => d.type === 'evRange'));
      let totalRange     = new CarDiagnostic(car.diagnostics.find(d => d.type === 'totalRange'));
      let odometer       = new CarDiagnostic(car.diagnostics.find(d => d.type === 'odometer'));
      let currentValue   = parseInt(evBatteryLevel.value);

      if (currentValue > minPercent) {
        let nextMin = currentValue > (minPercent + 5) ? currentValue - 5 : minPercent;
        currentValue = Math.round((Math.random() * (currentValue - nextMin) + nextMin) * 100) / 100;
        evChargeState.value = 'Not Charged';
        evRange.value = Math.round(((maxRange * currentValue / 100) * 100) / 100).toString();
      } else {
        currentValue = maxPercent.toString();
        evChargeState.value = 'Complete';
        evRange.value = maxRange.toString();
      }

      evBatteryLevel.value = currentValue.toString();
      totalRange.value = evRange.value;
      odometer.value = (parseInt(odometer.value) + 100).toString();

      yield evBatteryLevel.upsert();
      yield evChargeState.upsert();
      yield evRange.upsert();
      yield totalRange.upsert();
      yield odometer.upsert();
    }
  }
});
