'use strict';
let config = Bento.config.waivecar;

module.exports = function *() {
  if (!Bento.isTesting()) {
    yield require('./schedules/booking-auto-cancel');
    yield require('./schedules/booking-auto-lock');
    yield require('./schedules/booking-free-timer');
    yield require('./schedules/booking-free-timer-expired');
    yield require('./schedules/booking-location');
    yield require('./schedules/cars-sync');
    yield require('./schedules/cars-status');
    if (config.mock.cars) {
      yield require('./schedules/cars-mock-locations');
    }
  }
};
