var path = require('path');
var Blueprint = require(path.join(process.env.PWD, 'lib', 'route-blueprint'));
var express = require('express');

exports = module.exports = function(container, controller, logger) {

  var options = {
    app: this,
    container: container,
    controller: controller,
    logger: logger
  };

  return new Blueprint(options);
};

exports['@singleton'] = true;
exports['@require'] = [ '$container', 'controllers/notifications-controller', 'igloo/logger' ];
