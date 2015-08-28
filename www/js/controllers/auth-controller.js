angular.module('app.controllers').controller('AuthController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.data   = $data.models;
    $scope.active = $data.active;
    $scope.forms = {
      loginForm: {}
    };

    $scope.login = function() {
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
