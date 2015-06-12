var path = require('path');
var Blueprint = require(path.join(process.env.PWD, 'lib', 'route-blueprint'));
var express = require('express');

exports = module.exports = function(container, controller, tokenPassThrough, isAuthenticated, isAdmin, logger) {

  var app = this;
  var options = {
    app: app,
    container: container,
    controller: controller,
    logger: logger
  };

  Blueprint(options);
  app.post('/v1/vehicles/:id/commands/:command', tokenPassThrough, isAuthenticated, isAdmin, controller.executeCommand);

};

exports['@singleton'] = true;
exports['@require'] = [ '$container', 'controllers/vehicles-controller', 'policies/tokenPassThrough', 'policies/isAuthenticated', 'policies/isAdmin', 'igloo/logger' ];
