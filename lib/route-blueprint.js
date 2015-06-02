var _ = require('lodash');
var express = require('express');
var API_VERSION = 'v1';

exports = module.exports = function(options) {
  options = options || {};
  if (!options.app) throw new Error('App is a required option');
  if (!options.container) throw new Error('Container is a required option');
  if (!options.controller) throw new Error('Controller is a required option');
  if (!options.logger) throw new Error('Logger is a required option');

  var app = options.app;
  var container = options.container;
  var meta = options.controller.meta;
  var logger = options.logger;
  var isApi = meta.isApi;
  var routes = meta.routes;
  var router = express.Router();
  var path = '/' + meta.controllerName;
  if (isApi) path = [ '', API_VERSION, meta.controllerName ].join('/');
  if (meta.isRoot) path = '';

  _.forOwn(routes, function(route) {
    if ((route.enabled) && (!isApi || (isApi && !_.contains([ 'edit, new' ], route.action)))) {
      var params = [ ];
      _.each(route.policies, function(policy) { params.push(container.create('policies/' + policy)); });
      params.push(options.controller[route.action]);
      router[route.method](route.path, params);
      logger.debug('+ ' + [ path + route.path, meta.controllerName, route.method, route.action ].join(' - '));
    }
  });

  app.use(path, router);
};
