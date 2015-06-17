var path = require('path');
var Blueprint = require(path.join(process.env.PWD, 'lib', 'controller-blueprint'));

exports = module.exports = function(Model, config) {
  var options = {
    config: config,
    controllerName: 'settings',
    model: Model,
    modelName: 'setting'
  };

  return new Blueprint(options);
};

exports['@singleton'] = true;
exports['@require'] = [ 'models/setting', 'igloo/settings' ];
