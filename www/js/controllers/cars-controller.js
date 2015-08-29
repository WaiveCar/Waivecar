angular.module('app.controllers').controller('CarsController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.models = $data.models;
    $scope.active = $data.active;

    $scope.showCar = function(marker, id) {
      $state.go('cars-show', { id: id });
    }
  }
]);
