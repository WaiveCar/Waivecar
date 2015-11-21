'use strict';

let Car    = Bento.model('Car');
let config = Bento.config.waivecar;
let log    = Bento.Log;

module.exports = function *() {
  let cars = yield Car.find();
  let count = cars.length - 1;
  if (count > 3) {
    if (!config.cars.includeMock) {
      log.debug('removing mock cars');
      for (let carIndex = 0, len = count; carIndex < len; carIndex++) {
        let car = cars[carIndex];
        if (car.id === 'C0000017DC247801') {
          yield car.delete();
        }
      }
    }

    return;
  }
  log.debug(`Importing 8 mock cars`);
  if (config.cars.includeMock) {
    for (let i = 1, len = 9; i < len; i++) {
      let carId = 'MOCK_' + i;
      let car   = new Car({
        id           : carId,
        make         : 'Chevrolet',
        model        : 'Spark EV',
        year         : '2015',
        manufacturer : 'General Motors'
      });
      yield car.upsert();
    }
  }
};
