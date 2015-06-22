
// app - routes - paymentwebhook

var express = require('express');

exports = module.exports = function(container,controller,logger) {
  var app = this;
  var router = express.Router();
  router.post(
    '/',
    controller.index
  );
  app.use(
    '/v1/paymentWebHooks',
    router
  );
};
exports['@require'] = [ '$container', 'controllers/payment-web-hooks', 'igloo/logger' ];
exports['@singleton'] = true;
