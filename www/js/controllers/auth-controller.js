angular.module('app.controllers').controller('AuthController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$message',
  function ($rootScope, $scope, $state, $auth, $message) {
    'use strict';

    $scope.forms = {
      loginForm: {},
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
        return $message.info('Please fill in you credentials first.');
      }
      if (form.$invalid) {
        return $message.error('Please resolve form errors and try again.');
      }
      $auth.login($scope.forms.loginForm, sharedCallback);

    };

    $scope.forgot = function () {
      $auth.login($scope.forms.loginForm, sharedCallback);
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
