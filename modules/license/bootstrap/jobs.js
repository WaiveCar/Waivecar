'use strict';

module.exports = function *() {
  if (!Bento.isTesting()) {
    yield require('./schedules/license-sync');
  }
};
