'use strict';

let Car    = Bento.model('Car');
let config = Bento.config.waivecar;
let log    = Bento.Log;

module.exports = function *() {
  let cars = yield Car.find();
  let count = cars.length;
  if (!config.mock.cars) {
    log.debug('removing mock cars');
    for (let carIndex = 0, len = count; carIndex < len; carIndex++) {
      let car = cars[carIndex];
      if ([ 'EE000017DC652701', 'C0000017DC247801' ].indexOf(car.id) > -1) {
        log.debug(`removing ${ car.id }`);
        yield car.delete();
      }
    }
  } else if (count > 3) {
    return;
  }

};
