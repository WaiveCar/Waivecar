'use strict';
let config = Bento.config.waivecar;

module.exports = function *() {
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
  yield require('./schedules/cache-update');
  yield require('./schedules/parking-auto-cancel');
  yield require('./schedules/parking-notify-expiration');
  yield require('./schedules/notify-of-movement');
};
