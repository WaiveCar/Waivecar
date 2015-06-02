var helmet = require('helmet');

exports = module.exports = function(IoC, config) {

  var app = this;

  // trust proxy
  if (config.trustProxy) app.enable('trust proxy');

  // use helmet for security
  app.use(helmet());
};

exports['@require'] = [ '$container', 'igloo/settings' ];
