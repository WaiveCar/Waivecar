'use strict';

let VehicleService = require('./vehicle-service');
let config         = Reach.config;
let errorHandler   = Reach.ErrorHandler;

module.exports = function *() {
  if (!config.gm || !config.gm.host || !config.gm.api.key || !config.gm.api.secret) {
    errorHandler.log('error', 'GM API ERROR', {
      code     : 'GM_API_BAD_CONFIG',
      message  : 'Your general motors configuration is invalid',
      solution : 'Make sure you set up your config in the [./config/' + Reach.ENV + '] folder'
    });
    process.exit(1);
  }

  let service = new VehicleService();
  let result  = yield service.connect();

  if ('string' !== typeof result) {
    errorHandler.log('error', 'GM API ERROR', {
      code     : 'GM_API_BAD_CONNECTION',
      message  : 'Could not retrieve a bearerToken from the vehicle-service',
      solution : 'Make sure your GM host, key, and/or secret is correct'
    });
    process.exit(1);
  }
};