var express = require('express');

exports = module.exports = function(container, controller, isAuthenticated, isAnonymous, logger) {

  var app = this;
  var router = express.Router();

  router.post('/signin', isAnonymous, controller.signin);
  router.post('/signup', isAnonymous, controller.signup);
  router.get('/unlink/:provider', isAuthenticated, controller.unlink);

  router.post('/facebook', isAnonymous, controller.facebook);

  router.post('/forgot-password', isAnonymous, controller.resetRequest);
  router.get('/reset-password/:emailToken/:resetToken', isAnonymous, controller.reset);
  router.post('/reset-password', isAnonymous, controller.changePassword);

  app.use('/auth/', router);

};

exports['@require'] = [ '$container', 'controllers/auth-controller', 'policies/isAuthenticated', 'policies/isAnonymous', 'igloo/logger' ];
exports['@singleton'] = true;
