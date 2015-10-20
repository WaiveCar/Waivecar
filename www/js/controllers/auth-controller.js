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
      },
      verifyForm: {
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
          $state.go('auth-reset-password');
        })
        .catch($message.error);

    };

    $scope.submitNewPassword = function(form){
      if (form.$pristine) {
        return $message.info('Please fill in required fields first.');
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

      return FaceBookService.getLoginStatus()
        .then(function(response) {
          if (response.status !== 'connected') {
            return FaceBookService.login();
          }
          return response;

        })
        .then(function(res) {
          if (res.status === 'connected') {
            return $auth.loginWithFacebook(res.authResponse.accessToken);
          }
        })
        .then(function() {
          $state.go('users-edit', {
            id: $data.me.id
          });
        })
        .catch($message.error);

    };


    $scope.verify = function(form){
      if (form.$pristine) {
        return $message.info('Please fill in verification code first.');
      }
      if (form.$invalid) {
        return $message.error('Please resolve form errors and try again.');
      }

      $data.resources.Verification.verify($scope.forms.verifyForm).$promise
        .then(function(){
          if($scope.isWizard){
            return $state.go('licenses-photo-new', {step: 3});
          }
          $message.success('Your account is now verified!');
          $state.go('users-edit', {id: $auth.me.id});

        })
        .catch($message.error);

    };


    $scope.init = function() {
      $scope.isWizard = $stateParams.step;

      // if ($auth.isAuthenticated()) {
      //   $state.go('cars');
      // }

      if($state.includes('auth-reset-password')){
        $scope.forms.resetForm.tokenProvided = !!$stateParams.token;
      }

    };

    $scope.init();

  }

]);
