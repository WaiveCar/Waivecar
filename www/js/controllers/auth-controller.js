'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/message-service');
var _ = require('lodash');

module.exports = angular.module('app.controllers').controller('AuthController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$message',
  '$data',
  '$ionicHistory',
  '$cordovaOauth',
  '$settings',
  'FaceBookService',
  'ezfb',
  '$stateParams',
  function($rootScope, $scope, $state, $auth, $message, $data, $ionicHistory, $cordovaOauth, $settings, FaceBookService, ezfb, $stateParams) {
    $scope.$ionicHistory = $ionicHistory;

    $scope.forms = {
      loginForm: {
        from: 'app',
        // identifier: 'adibih@gmail.com',
      },
      forgotForm: {},
      resetForm: {
        token: $stateParams.token
      }
    };

    var sharedCallback = function(err) {
      if (err) {
        return $message.error(err);
      }
      $state.go('users-edit', {
        id: $data.me.id
      });

    };

    $scope.login = function(form) {
      if (form.$pristine) {
        return $message.info('Please fill in your credentials first.');
      }
      if (form.$invalid) {
        return $message.error('Please resolve form errors and try again.');
      }

      $auth.login($scope.forms.loginForm, sharedCallback);

    };

    $scope.initPasswordReset = function(form) {
      if (form.$pristine) {
        return $message.info('Please fill in your email first.');
      }
      if (form.$invalid) {
        return $message.error('Please resolve form errors and try again.');
      }

      $data.resources.User.initPasswordReset($scope.forms.forgotForm).$promise
        .then(function(){
          $state.go('auth-forgot-password-success');
        })
        .catch($message.error);

    };

    $scope.submitNewPassword = function(form){
      if (form.$pristine) {
        return $message.info('Please fill in your email first.');
      }
      if (form.$invalid) {
        return $message.error('Please resolve form errors and try again.');
      }

      var data = _.omit($scope.forms.resetForm, 'passwordConfirm');
      $data.resources.User.submitNewPassword(data).$promise
        .then(function(){
          $state.go('auth-reset-password-success');
        })
        .catch($message.error);

      };


    $scope.loginWithFacebook = function() {

      return ezfb.getLoginStatus()
        .then(function(response) {
          if (response.status !== 'connected') {
            return ezfb.login();
          }
          return response;

        })
        .then(function(res) {
          if (res.status === 'connected') {
            return $auth.loginWithFacebook(res.authResponse);
          }
        })
        .then(function() {
          $state.go('users-edit', {
            id: $data.me.id
          });
        })
        .catch($message.error);

    };


    $scope.init = function() {
      if ($auth.isAuthenticated()) {
        $state.go('cars');
      }

    };

    $scope.init();

  }

]);
