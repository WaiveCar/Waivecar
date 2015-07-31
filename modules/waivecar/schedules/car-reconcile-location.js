'use strict';

let scheduler   = Reach.service('queue').scheduler;
let Car         = Reach.model('Car');
let CarLocation = Reach.model('CarLocation');
let io          = Reach.IO;
let log         = Reach.Log;

module.exports = function *() {
  scheduler.add('car-reconcile-location', {
    init   : true,
    repeat : true,
    silent : true,
    timer  : {
      value : 10,
      type  : 'seconds'
    }
  });
};

scheduler.process('car-reconcile-location', function *(job) {
  let cars = yield Car.find();
  if (!cars) {
    return;
  }
  yield cars.hasOne(CarLocation, 'carId', 'location', [ 'latitude', 'longitude' ]);
  for (let i = 0, len = cars.length; i < len; i++) {
    let car          = cars[i];
    let prevLocation = car.location;
    let coords       = prevLocation ? getLocation(prevLocation.latitude, prevLocation.longitude, 100) : getLocation(37.422292, -122.148153, 5000);
    let location     = new CarLocation({
      carId     : car.id,
      latitude  : coords[1].toFixed(8),
      longitude : coords[0].toFixed(8),
    });
    yield location.upsert();
    if (!prevLocation) {
      car.location = {};
    }
    car.location.latitude  = coords[1].toFixed(8);
    car.location.longitude = coords[0].toFixed(8);
    io.flux({
      actionType : 'car:updated',
      car        : car
    });
  }
});

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