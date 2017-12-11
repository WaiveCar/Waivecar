'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/message-service');
var _ = require('lodash');

function AuthController ($injector) {
  var $state = $injector.get('$state');
  var $auth = $injector.get('$auth');
  var $message = $injector.get('$message');
  var $data = $injector.get('$data');
  var $stateParams = $injector.get('$stateParams');
  var $ionicHistory = $injector.get('$ionicHistory');
  var $ionicLoading = $injector.get('$ionicLoading');

  this.$ionicHistory = $ionicHistory;

  this.forms = {
    loginForm: {
      source: 'app'
    },
    forgotForm: {},
    resetForm: {
      token: $stateParams.token
    },
  };

  this.login = function login (form) {
    if (form.$pristine) {
      return $message.info('Please fill in your credentials first.');
    }
    if (form.$invalid) {
      return $message.error('Please resolve form errors and try again.');
    }

    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    return $auth.login(this.forms.loginForm)
      .then(function () {
        $ionicLoading.hide();
        $state.go('cars');
      })
      .catch(function (err) {
        $ionicLoading.hide();
        $message.error(err);
      });
  };

  this.initPasswordReset = function initPasswordReset (form) {
    if (form.$pristine) {
      return $message.info('Please fill in your email first.');
    }
    if (form.$invalid) {
      return $message.error('Please resolve form errors and try again.');
    }

    var identifier = this.forms.forgotForm.identifier;
    $data.resources.User.initPasswordReset(this.forms.forgotForm).$promise
      .then(function () {
        $state.go('auth-reset-password', {identifier: identifier});
      })
      .catch($message.error.bind($message));
  };

  this.submitNewPassword = function submitNewPassword (form) {
    if (form.$pristine) {
      return $message.info('Please fill in requguired fields first.');
    }
    if (form.$invalid) {
      return $message.error('Please resolve form errors and try again.');
    }

    var data = _.omit(this.forms.resetForm, 'passwordConfirm');
    $data.resources.User.submitNewPassword(data).$promise
      .then(function () {
        $state.go('auth-reset-password-success');
      })
      .catch(angular.bind($message, $message.error));

  };

  this.loginWithFacebook = function loginWithFacebook () {

    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    return $auth.facebookAuth()
      .then(function (res) {
        if (res.code === 'NEW_USER') {
          $ionicLoading.hide();
          return $state.go('users-new-facebook', {
            step: 2
          });
        } else if (res.code === 'LOGGED_IN') {
          $ionicLoading.hide();
          return $state.go('cars');
        }

      })
      .catch(function (e) {
        $ionicLoading.hide();
        console.log('fb error', e);
        // this is the useless facebook error
        //$message.error(err);
      });
  };

  this.init = function init () {
    if($state.includes('auth-reset-password')){
      this.forms.resetForm.tokenProvided = !!$stateParams.token;
      this.forms.resetForm.identifier = $stateParams.identifier;
    }
  };

  this.init();

}

module.exports = angular.module('app.controllers')
.controller('AuthController', ['$injector', AuthController]);
