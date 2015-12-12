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
  if (!this.all.length) {
    $modal.setData({
      title: 'Bummer',
      message: 'There are no WaiveCars currently available for rental. Please check back later.'
    });
    $modal.$promise.then(function () {
      $modal.show();
    });
  } else {
    this.closest = $distance.closest(cars);
    console.log('closest car at %d miles', this.closest);
    // check for max miles
    // TODO don't hardcode this
    if (this.closest > 30) {
      $modal.setData({
        title: 'Bummer',
        message: 'WaiveCar is currently available just in LA. Check back when you are in the area.'
      });
      $modal.$promise.then(function () {
        $modal.show();
      });
    }
  }

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

