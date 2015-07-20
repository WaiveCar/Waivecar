'use strict';

module.exports = function *() {
  if ('test' !== Reach.ENV) {
    require('./schedules/car-reconcile-fleet');
    require('./schedules/car-reconcile-diagnostics');
  }
};