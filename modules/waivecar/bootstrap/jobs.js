'use strict';

module.exports = function *() {
  if (Reach.ENV !== 'test') {
    yield require('./schedules/booking-timer-cancel');
    yield require('./schedules/car-reconcile-fleet');
    yield require('./schedules/car-reconcile-location');
    yield require('./schedules/car-reconcile-diagnostics');
    yield require('./schedules/car-update-client');
  }
};