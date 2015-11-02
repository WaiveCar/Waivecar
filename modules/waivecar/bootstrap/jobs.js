'use strict';

module.exports = function *() {
  if (!Bento.isTesting()) {
    yield require('./schedules/booking-auto-cancel');
    yield require('./schedules/car-reconcile-fleet');
    yield require('./schedules/car-reconcile-location');
    yield require('./schedules/car-reconcile-diagnostics');
    yield require('./schedules/car-update-client');
  }
};