'use strict';
var angular = require('angular');
require('angular-ui-router');

module.exports = angular.module('app.controllers').controller('CarsController', [
  'MockLocationService',
  '$state',
  '$data',
  '$message',
  CarsController
]);

function CarsController (LocationService, $state, $data) {
  this.cars = $data.resources.Car.query();

  this.showCar = function (car) {
    $state.go('cars-show', {
      id: car.id
    });
  };
}
