angular.module('app.controllers').controller('AuthController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  function ($rootScope, $scope, $state, $auth) {
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
      if ($auth.isAuthenticated()) $state.go('landing');
    };

    $scope.init();
  }
]);
