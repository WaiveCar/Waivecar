'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/message-service');

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
  function($rootScope, $scope, $state, $auth, $message, $data, $ionicHistory, $cordovaOauth, $settings, FaceBookService, ezfb) {
    $scope.$ionicHistory = $ionicHistory;

    $scope.forms = {
      loginForm: {
        from: 'app',
        // identifier: 'adibih@gmail.com',
      },
      forgotForm: {},
      resetForm: {}
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

    $scope.forgot = function(form) {
      if (form.$pristine) {
        return $message.info('Please fill in your email first.');
      }
      if (form.$invalid) {
        return $message.error('Please resolve form errors and try again.');
      }

      console.warn('AuthController.forgot not implemented');
      $state.go('auth-forgot-password-success');

    };


    $scope.loginWithFacebook = function() {
      // $cordovaOauth.facebook($settings.facebook.clientId, ['email', 'public_profile'], {
      //   redirect_uri: 'http://localhost:8100/callback'
      // })
      //   .then(function(result) {
      //     console.log(result);
      //   })
      //   .catch($message.error);

      // FaceBookService.getFacebookInfo()
      //   .then(function(rs){
      //     console.log(rs);
      //   })
      //   .catch($message.error);

      // OAuth.initialize('1022707721082213');
      // OAuth.popup('facebook')
      //   .done(function(result) {
      //     console.log(result);
      //     //use result.access_token in your API request
      //     //or use result.get|post|put|del|patch|me methods (see below)
      //   })
      //   .fail($message.error);

      // ezfb.getLoginStatus(function(res) {
      //   console.log(res);
      // });

      ezfb.login(null, {
          scope: 'email,public_profile'
        })
        .then(function(res) {
          console.log(res);
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
