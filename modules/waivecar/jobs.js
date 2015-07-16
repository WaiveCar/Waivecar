'use strict';

module.exports = function *() {
  if ('test' !== Reach.ENV) {
    require('./schedules/vehicle-reconcile-fleet');
    require('./schedules/vehicle-reconcile-diagnostics');
  }
};