angular.module('app.controllers').controller('BookingController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.models = $data.models;
    $scope.active = $data.active;

    $scope.fetch = function() {
    };

    $scope.init = function() {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }
    };

    $scope.init();
  }
]);
