var path = require('path');
var Blueprint = require(path.join(process.env.PWD, 'lib', 'route-blueprint'));
var express = require('express');

exports = module.exports = function(container, controller, tokenPassThrough, isAnonymous, isAuthenticated, isAdmin, logger) {

  var app = this;
  var options = {
    app: app,
    container: container,
    controller: controller,
    logger: logger
  };

  Blueprint(options);
  app.post('/v1/signup', tokenPassThrough, isAnonymous, controller.create);
  app.get('/v1/me', tokenPassThrough, isAuthenticated, controller.me);
  app.put('/v1/me', tokenPassThrough, isAuthenticated, controller.update);
};

exports['@require'] = [ '$container', 'controllers/users-controller', 'policies/tokenPassThrough', 'policies/isAnonymous', 'policies/isAuthenticated', 'policies/isAdmin', 'igloo/logger' ];
exports['@singleton'] = true;
