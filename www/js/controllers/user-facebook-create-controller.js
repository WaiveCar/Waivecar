'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');

function UserFacebookCreateController ($stateParams, $injector) {
  var $state = $injector.get('$state');
  var $auth = $injector.get('$auth');
  var $message = $injector.get('$message');

  if (!$auth.me) {
    return $state.go('landing');
  }

  this.user = $auth.me;

  this.completeFacebookRegistration = function completeFacebookRegistration (form) {
    if (form.$invalid) {
      return $message.error('Please fix form errors and try again.');
    }

    return this.user.$save()
      .then(function () {
        return $state.go('auth-account-verify', { step : 2 });
      })
      .catch($message.error.bind($message));
  };

}

module.exports = angular.module('app.controllers')
  .controller('UserFacebookCreateController', [
    '$stateParams',
    '$injector',
    UserFacebookCreateController
  ]);
