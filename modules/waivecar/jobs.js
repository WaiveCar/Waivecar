'use strict';

module.exports = function *() {
  if ('test' !== Reach.ENV) {
    yield require('./schedules/booking-timer-cancel');
    yield require('./schedules/car-reconcile-fleet');
    yield require('./schedules/car-reconcile-location');
  }
};