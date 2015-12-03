'use strict';

module.exports = function *() {
  if (!Bento.isTesting()) {
    yield require('./schedules/booking-auto-cancel');
    yield require('./schedules/booking-free-timer');
    yield require('./schedules/cars-sync');
    yield require('./schedules/cars-mock-locations');
  }
};
