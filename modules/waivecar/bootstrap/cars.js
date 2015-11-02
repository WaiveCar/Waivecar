'use strict';

let Car = Bento.model('Car');
let log = Bento.Log;

module.exports = function *() {
  let count = yield Car.count();
  if (count > 0) {
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