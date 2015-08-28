angular.module('app.controllers').controller('CarController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.data   = $data.models;
    $scope.active = $data.active;

    $scope.init = function() {
      $data.activate('cars', $state.params.id, function(err) {

      });
    };

    $scope.init();
  }
]);
