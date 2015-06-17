var path = require('path');
var express = require('express');

exports = module.exports = function(container, controller, tokenPassThrough, logger) {
  var app = this;
  app.post('/v1/logs', tokenPassThrough, controller.create);
};

exports['@singleton'] = true;
exports['@require'] = [ '$container', 'controllers/logs-controller', 'policies/tokenPassThrough', 'igloo/logger' ];