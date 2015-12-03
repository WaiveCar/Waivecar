'use strict';

let moment    = require('moment');
let scheduler = Bento.provider('queue').scheduler;
let relay     = Bento.Relay;
let log       = Bento.Log;
let service   = require('../../lib/car-service');
let config    = Bento.config.waivecar;

module.exports = function *() {
  scheduler.add('cars-sync', {
    init   : true,
    repeat : true,
    timer  : config.car.sync
  });
};


scheduler.process('cars-sync', function *(job) {
  log.info('Cars : Sync');

  let refreshedCars = yield service.syncCars();

  if (!refreshedCars) return;

  // Publish all Cars to connected clients.
  // NB. Cars will also be relayed during the sync process if they are updated.
  // This relay simply republishes all cars in one request (and includes those not touched by the sync).

  relay.emit('cars', {
    type : 'index',
    data : refreshedCars
  });
});
