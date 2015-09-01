angular.module('app.controllers').controller('CarsController', [
  '$rootScope',
  '$scope',
  '$state',
  function ($rootScope, $scope, $state) {

    $scope.showCar = function(marker, id) {
      $state.go('cars-show', { id: id });
    }
  }
]);
