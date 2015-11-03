'use strict';
var angular = require('angular');
require('angular-ui-router');

module.exports = angular.module('app.controllers').controller('CarsController', [
  '$rootScope',
  '$scope',
  '$state',
  '$data',
  '$message',
  function ($rootScope, $scope, $state, $data, $message) {

    $scope.showCar = function (marker, carId) {
      $state.go('cars-show', {
        id: carId
      });
    };

    $scope.init = function(){
      return $data.resources.Car.query().$promise
        .then(function(cars){
          $scope.cars = cars;
        })
        .catch($message.error);

    };

    $scope.init();

  }
]);
