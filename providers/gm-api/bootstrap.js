'use strict';

let VehicleService = require('./vehicle-service');
let config         = Reach.config;
let error          = Reach.Error;
let log            = Reach.Log;

module.exports = function *() {
  if (!config.gm || !config.gm.host || !config.gm.api.key || !config.gm.api.secret || !config.gm.onStart) {
    throw error.parse({
      code     : 'GM_API_BAD_CONFIG',
      message  : 'Your general motors configuration is invalid',
      solution : 'Make sure you set up your config in the [./config/' + Reach.ENV + '] folder'
    });
  }

  // ### Connection
  // Check if the connection to GM-API is good

  if (config.gm.onStart.testConnection) {
    log.debug('Checking gm-api connection state');

    let service = new VehicleService();
    let result  = yield service.connect();

    if (typeof result !== 'string') {
      throw error.parse({
        code     : 'GM_API_BAD_CONNECTION',
        message  : 'Could not retrieve a bearerToken from the vehicle-service',
        solution : 'Make sure your GM host, key, and/or secret is correct'
      });
    }
  }
};
