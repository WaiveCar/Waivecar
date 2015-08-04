'use strict';

let VehicleService = require('./vehicle-service');
let config         = Reach.config;
let error          = Reach.ErrorHandler;
let log            = Reach.Log;

module.exports = function *() {
  if (!config.gm || !config.gm.host || !config.gm.api.key || !config.gm.api.secret) {
    throw error.parse({
      code     : 'GM_API_BAD_CONFIG',
      message  : 'Your general motors configuration is invalid',
      solution : 'Make sure you set up your config in the [./config/' + Reach.ENV + '] folder'
    });
  }
  let service = new VehicleService();
  let result  = yield service.connect();
  if ('string' !== typeof result) {
    throw error.parse({
      code     : 'GM_API_BAD_CONNECTION',
      message  : 'Could not retrieve a bearerToken from the vehicle-service',
      solution : 'Make sure your GM host, key, and/or secret is correct'
    });
  }
};