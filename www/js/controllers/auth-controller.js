angular.module('app.controllers').controller('AuthController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.models = $data.models;
    $scope.active = $data.active;
    $scope.forms  = {
      loginForm  : {},
      forgotForm : {},
      resetForm  : {}
    };

    $scope.login = function() {
      $auth.login($scope.forms.loginForm, function(err) {
        $state.go('cars');
      });
    };

    $scope.forgot = function() {
      $auth.login($scope.forms.loginForm, function(err) {
        $state.go('cars');
      });
    };

    $scope.reset = function() {
      $auth.login($scope.forms.loginForm, function(err) {
        $state.go('cars');
      });
    };

    $scope.init = function() {
      if ($data.active.users) $state.go('landing');
    };

    $scope.init();
  }
]);
