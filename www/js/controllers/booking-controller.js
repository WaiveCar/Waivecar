angular.module('app.controllers').controller('BookingController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.data   = $data.models;
    $scope.active = $data.active;

    $scope.fetch = function() {
    };

    $scope.init = function() {
      if (!$data.active.users) {
        $state.go('auth');
      }
    };

    $scope.init();
  }
]);
