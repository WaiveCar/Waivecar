'use strict';

let Sequelize = require('sequelize');
let error     = Bento.Error;
let log       = Bento.Log;
let config    = Bento.config.sequelize;

if (!config) {
  throw error.parse({
    code     : `SEQUELIZE_MISSING_CONFIG`,
    message  : `Sequelize service is missing configuration`,
    solution : `Make sure you have created a configuration file for sequelize in the config folder.`
  });
}

let sequelize = new Sequelize(config.database, config.username, config.password, {
  host    : config.host,
  port    : config.port || null,
  dialect : config.dialect,
  pool    : {
    maxConnections : config.pool.max,
    minConnections : config.pool.min,
    maxIdleTime    : config.pool.idle
  },
  define : {
    underscored : true
  },
  logging(str) {
    // ...
  }
});

// ### Dirty Connection Fix

process.on('uncaughtException', (error) => {
  if (error.code !== 'PROTOCOL_CONNECTION_LOST') {
    throw error;
  }
});

module.exports = sequelize;
