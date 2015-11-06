'use strict';

let moment    = require('moment');
let scheduler = Bento.provider('queue').scheduler;
let Car       = Bento.model('Car');
let log       = Bento.Log;
let service   = require('../../lib/car-service');
let relay     = Bento.Relay;

module.exports = function *() {
  scheduler.add('cars-sync', {
    init   : true,
    repeat : true,
    timer  : {
      value : 30,
      type  : 'seconds'
    }
  });
};

scheduler.process('cars-sync', function *(job) {
  log.debug('Cars : Sync');

  // Retrieve all local Cars.
  let allCars = yield Car.find();

  // Filter cars to include either :
  // 1. car is currently in a booking (i.e. not available)
  // 2. never been updated
  // 3. last updated is greater than 15mins.
  let fifteenMinutesAgo = moment().subtract(15, 'minutes');
  let cars = allCars.filter((c) => {
    return !c.isAvailable || !c.updatedAt || moment(c.updatedAt).isBefore(fifteenMinutesAgo);
  });

  // If not cars left, no need to update.
  if (allCars.length > 8 && cars.length === 0) {
    log.debug('Cars : Sync : No cars to be synced.')
    return;
  }

  // Retrieve all Active Devices from Invers and loop.
  let devices = yield service.listDevices();
  log.debug(`Cars : Sync : ${ devices.length } devices to be synced.`);

  for (let i = 0, len = devices.length; i < len; i++) {
    // If Device matches a Car in our filtered list for updates, update
    let device = devices[i];
    let existingCar = cars.find(c => c.id === device.id);
    if (existingCar) {
      let updatedCar = yield service.device(device.id);
      log.debug(`Cars : Sync : updating ${ device.id }.`);
      yield existingCar.update(updatedCar);
    } else {
      // If Device does not match any Car then add it to the database.
      let excludedCar = allCars.find(c => c.id === device.id);
      if (!excludedCar) {
        let newCar = yield service.device(device.id);
        let car = new Car(newCar);
        log.debug(`Cars : Sync : adding ${ device.id }.`);
        yield car.upsert();
      } else {
        // If Device was found in database but not in our filtered list, ignore.
        log.debug(`Cars : Sync : skipping ${ device.id }.`);
      }
    }
  }

  // Publish Cars to connected clients.
  relay.emit('cars', {
    type : 'index',
    data : yield Car.find()
  });

});
