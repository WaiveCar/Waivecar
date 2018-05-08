'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Car       = Bento.model('Car');
let CarHistory= Bento.model('CarHistory');
let log       = Bento.Log;
let redis     = require('../../lib/redis-service');
let config    = Bento.config.waivecar;

scheduler.process('cars-odometer', function *(job) {
  // make sure we only do this about once every 24 hours. Give it a slippage window just
  // to make sure we get every day.
  if (! (yield redis.shouldProcess('odometer-reading', 1, 20 * 60 * 60 * 1000) ) ) {
    return;
  }

  let carList = yield Car.find();
  for (let i = 0; i < carList.length; i++) {
    let car = carList[i];

    let record = new CarHistory({
      carId:  car.id,
      action: 'ODOMETER',
      data:   car.totalMileage
    });

    yield record.save();
  }
});

module.exports = function *() {
  scheduler.add('cars-odometer', {
    init   : true,
    repeat : true,
    timer  : config.car.odometer
  });
};
