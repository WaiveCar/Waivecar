'use strict';

let moment    = require('moment');
let service   = require('../../lib/car-service');
let scheduler = Bento.provider('queue').scheduler;
let relay     = Bento.Relay;
let log       = Bento.Log;
let config    = Bento.config.waivecar;

module.exports = function *() {
  scheduler.add('cars-sync', {
    init   : true,
    repeat : true,
    timer  : config.car.sync
  });
};

scheduler.process('cars-sync', function *(job) {
  //let cars = yield service.syncCars();
  let fridges = yield service.syncFridges(); 
  /*
  if (cars && (yield service.shouldRelay())) {
    cars.relay('index');
  }
  */
});
