'use strict';

let Car = Reach.model('Car');
let log = Reach.Log;

module.exports = function *() {
  let count = yield Car.count();
  if (count > 20) {
    return;
  }
  log.debug('importing 20 mock cars');
  for (let i = 0, len = 20; i < len; i++) {
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
};