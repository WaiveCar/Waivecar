'use strict';

let Car         = Reach.model('Car');
let CarLocation = Reach.model('CarLocation');
let log         = Reach.Log;

module.exports = function *() {
  let count = yield Car.count();
  if (count > 100) {
    return;
  }
  log.debug('importing 190 mock cars');
  for (let i = 0, len = 190; i < len; i++) {
    let carId = 'MOCK_' + i;

    // ### Create Car

    let car = new Car({
      id           : carId,
      make         : 'Chevrolet',
      model        : 'Spark EV',
      year         : '2015',
      manufacturer : 'General Motors'
    });
    yield car.upsert();

    // ### Set Location

    let coords   = getLocation(37.422292, -122.148153, 5000);
    let location = new CarLocation({
      carId     : carId,
      latitude  : coords[1].toFixed(8),
      longitude : coords[0].toFixed(8),
    });
    yield location.upsert();
  }
};

function getLocation(x0, y0, radius) {
  let random          = Math.random();
  let radiusInDegrees = radius / 111300;

  let u  = Math.random();
  let v  = Math.random();
  let w  = radiusInDegrees * Math.sqrt(u);
  let t  = 2 * Math.PI * v;
  let x  = w * Math.cos(t);
  let y1 = w * Math.sin(t);
  let x1 = x / Math.cos(y0);

  return [(y0 + y1), (x0 + x1)];
}