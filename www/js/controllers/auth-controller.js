angular.module('app.controllers').controller('AuthController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$message',
  '$loading',
  function ($rootScope, $scope, $state, $auth, $message, $loading) {
    'use strict';

    $scope.forms = {
      loginForm: {
        from: 'app'
      },
      forgotForm: {},
      resetForm: {}
    };

    var sharedCallback = function (err) {
      if (err) {
        return $message.error(err);
      }
      $state.go('landing');

    };

    $scope.login = function (form) {
      if (form.$pristine) {
        return $message.info('Please fill in your credentials first.');
      }
      if (form.$invalid) {
        return $message.error('Please resolve form errors and try again.');
      }
      $auth.login($scope.forms.loginForm, sharedCallback);

    };

    $scope.forgot = function (form) {
      if (form.$pristine) {
        return $message.info('Please fill in your email first.');
      }
      if (form.$invalid) {
        return $message.error('Please resolve form errors and try again.');
      }

      console.warn('AuthController.forgot not implemented');
      $state.go('auth-forgot-password-success');

    };

    $scope.reset = function () {
      $auth.login($scope.forms.loginForm, sharedCallback);
    };

    $scope.init = function () {
      if ($auth.isAuthenticated()) {
        $state.go('landing');
      }

    };

    $scope.init();

  }

]);
