'use strict';
let config = Bento.config.waivecar;

module.exports = function *() {
  if (!Bento.isTesting()) {
    yield require('./schedules/booking-auto-cancel');
    yield require('./schedules/booking-auto-lock');
    yield require('./schedules/booking-free-timer');
    yield require('./schedules/booking-free-timer-expired');
    yield require('./schedules/booking-forfeiture-first-warning');
    yield require('./schedules/booking-forfeiture-second-warning');
    yield require('./schedules/booking-forfeiture');
    yield require('./schedules/active-booking');
    yield require('./schedules/cars-sync');
    yield require('./schedules/cars-status');
    yield require('./schedules/user-car-availability-timer');
    if (config.mock.cars) {
      yield require('./schedules/cars-mock-locations');
    }
  }
};
