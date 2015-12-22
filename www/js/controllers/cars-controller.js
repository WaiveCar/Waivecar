'use strict';
var _ = require('lodash');
var angular = require('angular');
require('../services/distance-service');
require('../services/modal-service');
require('angular-ui-router');

module.exports = angular.module('app.controllers').controller('CarsController', [
  '$rootScope',
  '$scope',
  '$state',
  '$injector',
  '$data',
  'cars',
  '$modal',
  CarsController
]);

function CarsController ($rootScope, $scope, $state, $injector, $data, cars, $modal) {
  var $distance = $injector.get('$distance');
  var LocationService = $injector.get('LocationService');
  // the accuracy should be within this amount of meters to show the Bummer dialog
  var accuracyThreshold = 200;

  LocationService.getCurrentLocation()
    .then(function () {
      this.carsInRange();
    }.bind(this));

  this.clearCarWatcher = $scope.$watch(function () {
    return $data.instances.cars;
  }, function (value) {
    if (!value) {
      return false;
    }
    this.all = prepareCars(value);
  }.bind(this), true);

  $scope.$on('$destroy', function () {
    this.clearCarWatcher();
  }.bind(this));


  // First load
  this.all = prepareCars(cars);

  this.carsInRange = function() {
    if (!this.all.length) {
      $modal('simple-modal', {
        title: 'Bummer',
        message: 'There are no WaiveCars currently available for rental. Please check back later.'
      }).then(function (modal) {
        modal.show();
      });
    } else {
      if ($rootScope.currentLocation &&
        $rootScope.currentLocation.accuracy &&
        $rootScope.currentLocation.accuracy >= accuracyThreshold) {
          return;
      }
      this.closest = $distance.closest(cars);
      console.log('closest car at %d miles', this.closest);
      // check for max miles
      // TODO don't hardcode this
      if (this.closest > 30 || isNaN(this.closest)) {
        this.outOfRange = true;
        $modal('simple-modal', {
          title: 'Bummer',
          message: 'WaiveCar is currently only available in LA. Check back when you are in the area.'
        }).then(function (modal) {
          modal.show();
        });
      }
    }
  };

  function prepareCars (items) {
    return _.map(items, function (item) {
      if (!item.hasOwnProperty('isAvailable')) {
        return item;
      }
      if (item.isAvailable) {
        item.icon = 'car';
      } else {
        item.icon = 'unavailable';
      }
      return item;
    });
  };

  this.showCar = function showCar (car) {
    if (car.isAvailable === false) {
      console.error('Should show car unavailable modal here');
    } else {
      $state.go('cars-show', {
        id: car.id
      });
    }
  };
}

