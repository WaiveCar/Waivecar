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

function CarsController (LocationService, $state, $data, $message) {
  $data.resources.Car.query().$promise
    .then(function(cars){
      this.cars = cars;
      console.log('cars', cars);
    }.bind(this))
    .catch($message.error.bind($message));

  this.showCar = function (car) {
    $state.go('cars-show', {
      id: car.id
    });
  };
}
