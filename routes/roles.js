var express = require('express');

exports = module.exports = function(container, controller, tokenPassThrough, isAuthenticated, isAdmin, logger) {

  var app = this;
  var router = express.Router();

  router.get('/', tokenPassThrough, isAuthenticated, isAdmin, controller.index);
  app.use('/v1/roles', router);

};

exports['@require'] = [ '$container', 'controllers/roles-controller', 'policies/tokenPassThrough', 'policies/isAuthenticated', 'policies/isAdmin', 'igloo/logger' ];
exports['@singleton'] = true;
