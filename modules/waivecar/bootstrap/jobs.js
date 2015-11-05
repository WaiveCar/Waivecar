'use strict';

module.exports = function *() {
  if (!Bento.isTesting()) {
    yield require('./schedules/booking-auto-cancel');
    yield require('./schedules/car-resync-fleet');
    yield require('./schedules/car-resync-cars');
    yield require('./schedules/car-mock-locations');
  }
};
