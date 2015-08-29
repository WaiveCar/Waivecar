'use strict';

let scheduler   = Reach.service('queue').scheduler;
let Car         = Reach.model('Car');
let CarLocation = Reach.model('CarLocation');
let log         = Reach.Log;

module.exports = function *() {
  scheduler.add('car-reconcile-location', {
    init   : true,
    repeat : true,
    silent : true,
    timer  : {
      value : 2,
      type  : 'minutes'
    }
  });
};

// ### Car Reconcile Location
// Loops through available cars in the database and updates their location randomly.
// This is a mock job to simulate GM data.
// Santa Monica Mock Location:
// "latitude": 34.0464846,
// "longitude": -118.4442262,
// "city": "Los Angeles",
// "state": "CA",
// "street_address": "11100 Santa Monica Blvd.",
// "zip": "90025",

scheduler.process('car-reconcile-location', function *(job) {
  let cars = yield Car.find({
    include : [{
      model : 'CarLocation',
      as    : 'location'
    }]
  });
  if (!cars) {
    return;
  }
  for (let i = 0, len = cars.length; i < len; i++) {
    let car          = cars[i];
    let prevLocation = car.location;
    let coords       = prevLocation ? getRandomLocation(prevLocation.latitude, prevLocation.longitude, 100) : getRandomLocation(34.0464846, -118.4442262, 5000);
    let location     = new CarLocation({
      carId     : car.id,
      latitude  : coords[1],
      longitude : coords[0]
    });
    yield location.upsert();
  }
});

/**
 * Generate a random location within the provided radius in meters.
 * @private
 * @method getRandomLocation
 * @param  {Float} x0
 * @param  {Float} y0
 * @param  {Int}   radius
 * @return {Array} [longitude, latitude]
 */
function getRandomLocation(x0, y0, radius) {
  let random          = Math.random();
  let radiusInDegrees = radius / 111300;

  let u  = Math.random();
  let v  = Math.random();
  let w  = radiusInDegrees * Math.sqrt(u);
  let t  = 2 * Math.PI * v;
  let x  = w * Math.cos(t);
  let y1 = w * Math.sin(t);
  let x1 = x / Math.cos(y0);

  return [ (y0 + y1), (x0 + x1) ];
}