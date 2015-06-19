angular.module('app.controllers').controller('VehiclesController', [
  '$scope',
  '$stateParams',
  '$data',
  function($scope, $stateParams, $data) {
    'use strict';

    $scope.data = $data.data;
    $scope.active = $data.active;
  }
]);
