'use strict';

let Car = Bento.model('Car');
let log = Bento.Log;

module.exports = function *() {
  let count = yield Car.count();
  if (count > 9) {
    return;
  }
  log.debug(`Importing 8 mock cars`);
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
};
