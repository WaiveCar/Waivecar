'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');

function _UserFacebookCreateController($injector){
  var $state = $injector.get('$state');
  var $auth = $injector.get('$auth');
  var $message = $injector.get('$message');

  if (!$auth.me) {
    return $state.go('auth');
  }

  this.user = $auth.me;

  this.completeFacebookRegistration = function(form){
    if (form.$invalid) {
      return $message.error('Please fix form errors and try again.');
    }

    return this.user.$save()
      .then(function () {
        return $state.go('auth-account-verify', { step: 2 });
      })
      .catch($message.error.bind($message));
  };

}

function UserFacebookCreateController($injector){
  var $state = $injector.get('$state');
  var $auth = $injector.get('$auth');
  var $message = $injector.get('$message');

  if (!$auth.me) {
    return $state.go('auth');
  }

  this.user = $auth.me;
  this.completeFacebookRegistration = function(form){
    if (form.$invalid) {
      return $message.error('Please fix form errors and try again.');
    }

    return this.user.$save()
      .then(function () {
          $auth.logout();
          return $state.go('user-waitlist');//'auth-account-verify', {step: 2});
      })
      .catch($message.error.bind($message));
  };

}

module.exports = angular.module('app.controllers')
  .controller('UserFacebookCreateController', [
    '$injector',
    UserFacebookCreateController
  ]);
