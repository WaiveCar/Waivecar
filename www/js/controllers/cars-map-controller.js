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
  'locations',
  '$modal',
  CarsMapController
]);

function CarsMapController($rootScope, $scope, $state, $injector, $data, cars, locations, $modal) {
  var $distance = $injector.get('$distance');
  var LocationService = $injector.get('LocationService');
  // the accuracy should be within this amount of meters to show the Bummer dialog
  var minAccuracyThreshold = 200;
  var modal;

  // First load
  this.all = prepareCars(cars);
  this.fitBoundsByMarkers = getMarkersToFitBoundBy(this.all);

  ensureAvailableCars(cars);

  this.stopLocationWatch = LocationService.watchLocation(
    function(currentLocation, isInitialCall) {
      if (isInitialCall) {
        this.fitMapBoundsByMarkers = getMarkersToFitBoundBy(this.all, currentLocation);
        carsInRange(this.all, currentLocation);
      }
      this.currentLocation = currentLocation;

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

    return false;
  }.bind(this), true);

  $scope.$on('$destroy', function () {
    if (this.stopLocationWatch) {
      this.stopLocationWatch();
    }
    this.clearCarWatcher();
  }.bind(this));

  function ensureAvailableCars(allCars) {
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
  }

  function carsInRange(allCars, currentLocation) {
    if (
      !currentLocation || (
      currentLocation &&
      currentLocation.accuracy &&
      currentLocation.accuracy >= minAccuracyThreshold)
    ) {
      return;
    }

    var maxDistance = 30; // at least one car should be less than 30 miles away
    var carInRange = _(allCars).find(function (car) {
      var distance = $distance(car, currentLocation);
      return _.isFinite(distance) && distance < maxDistance;
    });

    if (carInRange == null) {
      if (modal && modal.isShown()) {
        return;
      }
      $modal('simple-modal', {
        title: 'Bummer',
        message: 'WaiveCar is not available in your area. Check back when you are in LA or select markets.'
      }).then(function (_modal) {
        modal = _modal;
        modal.show();
      });
    }
  }

  function prepareCars(items) {
    var homebase = locations.filter(function(location){
      // todo this sholdn't be so retarded.
      if( location.type === 'homebase' ) {
        if($data.me.hasTag('level')) {
          // like this hard coded id here, that's really bad form.
          return location.id === 1246;
        } else {
          return true;
        }
      }
    })[0];

    var tempItems = _.partition(items, function (item) {
      var miles = $distance(item, homebase);
      var yards = miles * 1760;
      return yards < 100;
    });
    // items within 100 yards of homebase will get on the same marker
    homebase.size = _.filter(tempItems[0], 'isAvailable').length;
    homebase.isAvailable = homebase.size > 0;
    homebase.icon = 'homebase-active';
    homebase.isWaiveCarLot = true;
    homebase.cars = tempItems[0];
    homebase.id = 'homebase';

    // The homebase is region specific so we set it here.
    $data.homebase = homebase;

    var awayCars = tempItems[1].filter(function (item) {
      return item.isAvailable;
    }).map(function (item) {
      if (item.hasOwnProperty('isAvailable')) {
        item.icon = 'car';
      }
      return item;
    });

    awayCars.push(homebase);
    return awayCars;
  }

  function getMarkersToFitBoundBy(all, currentLocation) {
    var fitBoundsMarkers = all.slice();

    if (currentLocation) {
      fitBoundsMarkers.push(currentLocation);
    }
    return fitBoundsMarkers;
  }

  this.showCar = function showCar(car) {
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

  function showCarUnavailableModal() {
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

  function showLotUnavailableModal() {
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

  function showCarTooFarModal() {
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
