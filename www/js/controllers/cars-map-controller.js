'use strict';
var _ = require('lodash');
var angular = require('angular');
require('../services/distance-service');
require('../services/modal-service');
require('angular-ui-router');

module.exports = angular.module('app.controllers').controller('CarsMapController', [
  '$rootScope',
  '$scope',
  '$state',
  '$injector',
  '$data',
  'cars',
  '$modal',
  '$interval',
  CarsMapController
]);

function CarsMapController ($rootScope, $scope, $state, $injector, $data, cars, $modal, $interval) {
  var $distance = $injector.get('$distance');
  var LocationService = $injector.get('LocationService');
  // the accuracy should be within this amount of meters to show the Bummer dialog
  var minAccuracyThreshold = 200;
  var modal;

  LocationService.getCurrentLocation()
    .then(function (latlon) {
      //this.mapControl.fitBounds();
      this.location = latlon;
      //this.location = { latitude: 34.016660, longitude: -118.489252 };

      this.all = prepareCars(cars);
      this.featured = featured(this.all, this.location);

      this.carsInRange();
    }.bind(this)
  );


  this.clearCarWatcher = $scope.$watch(function () {
    return $data.instances.cars;
  }, function (value) {
    if (value == null) {
      return false;
    }
    if (Array.isArray(value) && !value.length) {
      return false;
    }
    this.all = prepareCars(value);
    if (this.location)
      this.featured = featured(this.all, this.location);

    return false;
  }.bind(this), true);

  $scope.$on('$destroy', function () {
    this.clearCarWatcher();
  }.bind(this));


  // First load
  this.all = prepareCars(cars);

  ensureAvailableCars(cars);

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
    if (
      !$rootScope.currentLocation || (
        $rootScope.currentLocation &&
        $rootScope.currentLocation.accuracy &&
        $rootScope.currentLocation.accuracy >= minAccuracyThreshold)
      ) {
        return;
    }

    var maxDistance = 30; // at least one car should be less than 30 miles away
    var carInRange = _(this.all).find(function (car) {
      var distance = $distance(car);
      return _.isFinite(distance) && distance < maxDistance;
    });

    if (carInRange == null) {
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
    var homebase = {
      latitude: 34.016338,
      longitude: -118.489212
    };
    var tempItems = _.partition(items, function (item) {
      var miles = $distance(item, homebase);
      var yards = miles * 1760;
      return yards < 100;
    });
    // items within 100 yards of homebase will get on the same marker
    homebase.length = _.filter(tempItems[0], 'isAvailable').length;
    homebase.isAvailable = homebase.length > 0;
    homebase.icon = 'homebase-active';
    homebase.isWaiveCarLot = true;
    homebase.cars = tempItems[0];
    homebase.id = 'homebase';

    var awayCars = tempItems[1].filter(function(item) {
      return item.isAvailable;
    }).map(function(item) {
      if (item.hasOwnProperty('isAvailable')) {
        item.icon = 'car';
      }
      return item;
    });

    awayCars.push(homebase);
    return awayCars;
  };

  function featured (items, userLocation) {
    return _(items)
      .filter('isAvailable')
      .sortBy(function (item) {
        if (userLocation) {
          return $distance(item, userLocation);
        }
        return item.id;
      })
      .take(1)
      .value();
  }

  this.showCar = function showCar (car) {
    if (car.isWaiveCarLot) {
      var ids = _(car.cars).filter('isAvailable').map('id').value();
      if (ids.length) {
        $state.go('cars-list', {
          ids: ids
        });
      } else {
        showLotUnavailableModal();
      }
      return true;
    }
    if (car.isAvailable === false) {
      showCarUnavailableModal();
      return true;
    }
    var distance = $distance(car);
    if (distance > 10) {
      showCarTooFarModal();
      return true;
    }
    $state.go('cars-show', {
      id: car.id
    });
    return false;
  };

  function showCarUnavailableModal () {
    var unavailableModal;
    $modal('result', {
      icon: 'x-icon',
      title: 'This WaiveCar is unavailable right now',
      message: 'The green icons on the map are the available WaiveCars.',
      actions: [{
        text: 'Ok',
        handler: function () {
          unavailableModal.remove();
        }
      }]
    })
    .then(function (_modal) {
      unavailableModal = _modal;
      unavailableModal.show();
    });
  }

  function showLotUnavailableModal () {
    var unavailableModal;
    $modal('result', {
      icon: 'x-icon',
      title: 'There are no WaiveCars available in the homebase right now',
      actions: [{
        text: 'Ok',
        handler: function () {
          unavailableModal.remove();
        }
      }]
    })
    .then(function (_modal) {
      unavailableModal = _modal;
      unavailableModal.show();
    });
  }

  function showCarTooFarModal () {
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
  }

  $scope.$on('$destroy', function () {
    if (modal) {
      modal.remove();
    }
  });
}
