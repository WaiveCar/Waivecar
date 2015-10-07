'use strict';

let VehicleService = require('./vehicle-service');
let config         = Reach.config.gm;
let error          = Reach.Error;
let log            = Reach.Log;

module.exports = function *() {
  if (!config || !config.host || !config.api.key || !config.api.secret || !config.onStart) {
    throw error.parse({
      code     : 'GM_API_BAD_CONFIG',
      message  : 'Your general motors configuration is invalid',
      solution : 'Make sure you set up your config in the [./config/' + Reach.ENV + '] folder'
    });
  }

  // ### Connection
  // Check if the connection to GM-API is good

  if (config.onStart.testConnection) {
    log.debug('Checking gm-api connection state');
    try {
      let service = new VehicleService();
      let result  = yield service.connect();
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        log.error({
          code    : 'GM_API_BAD_CONNECTION',
          message : 'Could not establish a connection with the GM api'
        })
      }
    }
  }
};
