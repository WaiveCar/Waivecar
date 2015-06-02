var winstonRequestLogger = require('winston-request-logger');

exports = module.exports = function(config, logger) {
  return function (app){
    // winston request logger before everything else
    if (config.logger.requests) {
      app.use(winstonRequestLogger.create(logger));
    }
  };
};

exports['@singleton'] = true;
exports['@require'] = ['igloo/settings', 'igloo/logger'];
