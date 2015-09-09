angular.module('app.controllers').controller('AuthController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  function ($rootScope, $scope, $state, $auth) {
    $scope.forms  = {
      loginForm  : {
        from : 'app'
      },
      forgotForm : {},
      resetForm  : {}
    };

    $scope.login = function() {
      $auth.login($scope.forms.loginForm, function(err) {
        $state.go('landing');
      });
    };

    $scope.forgot = function() {
      $auth.login($scope.forms.loginForm, function(err) {
        $state.go('landing');
      });
    };

    $scope.reset = function() {
      $auth.login($scope.forms.loginForm, function(err) {
        $state.go('landing');
      });
    };

    $scope.init = function() {
      if ($auth.isAuthenticated()) $state.go('landing');
    };

    $scope.init();
  }
]);
