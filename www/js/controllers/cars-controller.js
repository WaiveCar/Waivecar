'use strict';
var angular = require('angular');
require('angular-ui-router');

module.exports = angular.module('app.controllers').controller('CarsController', [
  '$rootScope',
  '$scope',
  '$state',
  '$injector',
  'cars',
  CarsController
]);

function CarsController ($rootScope, $scope, $state, $injector, cars) {
  this.all = cars;
  this.currentLocation = $rootScope.currentLocation;
  this.modal = {
    title: 'Bummer',
    actions: {}
  };

  if (!this.all.length) {
    this.modal.message = 'There are no WaiveCars currently available for rental. Please check back later.';
    if (typeof this.modal.actions.show === 'function') {
      this.modal.actions.show();
    }
  }

  this.showCar = function (car) {
    $state.go('cars-show', {
      id: car.id
    });
  };
}

