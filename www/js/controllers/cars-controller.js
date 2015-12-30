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
  var minAccuracyThreshold = 200;
  var modal;

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
  ensureAvailableCars(this.all);

  function ensureAvailableCars (allCars) {
    var availableCars = _.filter(allCars, 'isAvailable');
    if (availableCars.length) {
      return;
    }
    if (modal && modal.isShown()) {
      return;
    }
    $modal('simple-modal', {
      title: 'Bummer',
      message: 'There are no WaiveCars currently available for rental. Please check back later.'
    }).then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  };

  this.carsInRange = function() {
    if ($rootScope.currentLocation &&
      $rootScope.currentLocation.accuracy &&
      $rootScope.currentLocation.accuracy >= minAccuracyThreshold) {
        return;
    }

    var availableCars = _.filter(this.all, 'isAvailable');
    this.closest = $distance.closest(availableCars);
    console.log('closest car at %d miles', this.closest);
    // check for max miles
    // TODO don't hardcode this
    if (this.closest > 30 || isNaN(this.closest)) {
      if (modal && modal.isShown()) {
        return;
      }
      this.outOfRange = true;
      $modal('simple-modal', {
        title: 'Bummer',
        message: 'WaiveCar is currently only available in LA. Check back when you are in the area.'
      }).then(function (_modal) {
        modal = _modal;
        modal.show();
      });
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
      return true;
    }
    var distance = $distance.getDistance(car);
    if (distance > 10) {
      var farModal;
      $modal('result', {
        icon: 'x-icon',
        title: 'You\'re too far away to rent this car',
        message: 'Get within 10 miles of the WaiveCar to book it.',
        actions: [{
          text: 'Close',
          handler: function () {
            farModal.remove();
          }
        }]
      })
      .then(function (_modal) {
        farModal = _modal;
        farModal.show();
      });
      return true;
    }
    $state.go('cars-show', {
      id: car.id
    });
    return false;
  };

  $scope.$on('$destroy', function () {
    if (modal) {
      modal.remove();
    }
  });
}

