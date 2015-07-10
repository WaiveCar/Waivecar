var _ = require('lodash');
var moment = require('moment');
var path = require('path');
var Blueprint = require(path.join(process.env.PWD, 'lib', 'controller-blueprint'));

exports = module.exports = function(Model, config, logger) {

  var methods = {
    meta: {
      config: config,
      controllerName: 'blacklisted-emails',
      model: Model,
      modelName: 'blacklistedEmail'
    }
  };

  return _.merge(new Blueprint(methods.meta), methods);
};

exports['@singleton'] = true;
exports['@require'] = [ 'models/blacklisted-email', 'igloo/settings', 'igloo/logger' ];
