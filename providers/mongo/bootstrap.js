'use strict';

let log   = Bento.Log;
let error = Bento.Error;

if (!Bento.config.mongo) {
  throw error.parse({
    code     : 'MONGODB_MISSING_CONFIG',
    message  : 'MongoDB provider is missing required server configuration',
    solution : 'Make sure you have created a configuration file for mongo in the config folder'
  });
} else {
  log.info(' - Mongo configuration passed!');
}

module.exports = function *() {
  yield require('./setup');
};
