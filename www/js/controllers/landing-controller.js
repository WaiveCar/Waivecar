angular.module('app.controllers').controller('LandingController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {

    $scope.init = function() {

      if ($auth.isAuthenticated()) {
        $state.go('cars');
      } else {
        $state.go('auth');
      }
    };

    $scope.init();
  }
]);
