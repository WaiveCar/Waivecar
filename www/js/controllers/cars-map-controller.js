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
  var ctrl = this;

  // First load
  // Need zones outside rental. See #1114
  var zones = [];
  /*
   * this is new rather untested code that fucks up brooklyn so
   * for now it's commented out until it can be done right.
   *
  var zones = locations.filter(function (x) {
    return x.type === 'zone';
  });
  */
  
  this.all = cars;

  function firstLoad(currentLocation) {
    if(!ctrl.clearCarWatcher) {
      ctrl.clearCarWatcher = $scope.$watch(function () {
        return $data.instances.cars;
      }, function (value) {
        if (value == null) {
          return false;
        }
        if (Array.isArray(value) && !value.length) {
          return false;
        }

        ctrl.all = prepareCars(value);

        return false;
      }, true);
    }

    ctrl.all = prepareCars(cars);
    ctrl.fitMapBoundsByMarkers = getMarkersToFitBoundBy(ctrl.all, currentLocation);
    carsInRange(ctrl.all, currentLocation);
    ensureAvailableCars(cars);
  }

  if($rootScope.currentLocation) {
    this.currentLocation = $rootScope.currentLocation;
    firstLoad(this.currentLocation);
  }

  // tells us whether it's available and reachable 
  function isCarAccessible(row) {
    // distance is in miles ... we don't show (or consider) 
    // cars that are really really far away
    return (row.isAvailable && $distance(row) < 150);
  }

  this.stopLocationWatch = LocationService.watchLocation(
    function(currentLocation, isInitialCall) {
      if(!this.currentLocation) {
        this.currentLocation = currentLocation;
        firstLoad(currentLocation);
      }

      this.currentLocation = currentLocation;
    }.bind(this)
  );

  /*
  this.clearCarWatcher = $scope.$watch(function () {
    var zzones = $data.instances.locations
      .filter(function (x) {
        return x.type === 'zone'
      });
    return {
      cars: $data.instances.cars,
      zones: zzones
    };
  }, function (value) {
    if (value.cars == null || value.zones == null) {
      return false;
    }

    if (Array.isArray(value.cars) && !value.cars.length) {
      return false;
    }

    if (Array.isArray(value.zones) && !value.zones.length) {
      return false;
    }

    this.all = prepareCars(value.cars)
      .concat(value.zones);

    return false;
  }.bind(this), true);
  */

  $scope.$on('$destroy', function () {
    if (this.stopLocationWatch) {
      this.stopLocationWatch();
    }
    if(this.clearCarWatcher) {
      this.clearCarWatcher();
    }
  }.bind(this));

  function ensureAvailableCars(allCars) {
    var availableCars = _.filter(allCars, isCarAccessible);

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

  function hasTag(tag) {
    if($data.me && $data.me.tagList) {
      return $data.me.tagList.filter(function(row) {
        return row.groupRole.name === tag;
      }).length;
    } else {
      console.log("No taglist", $data.me);
    }
  }

  function prepareCars(items) {
    var res = locations.filter(function(location){
      // todo this sholdn't be so retarded.
      if( location.type === 'homebase' ) {
        // it's possible for $data.me.hasTag not to exist, I don't know how.
        // and it's 5am when I'm writing this so we're being ineffecient here.
        if(hasTag('level')) {
          // like this hard coded id here, that's really bad form.
          // Also note that below we assign a new id of a string value
          // to a copy of the homebase object to.
          return location.id === 1246;
        } else {
          return true;
        }
      }
    })[0];

    if(res) {
      // make sure we don't pollute our pristine database results.
      var homebase = Object.assign({}, res);
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
      //
      // we have this information in the type field ... I don't
      // think any legacy code is looking at this. We should 
      // certainly not be doing it.
      //
      //homebase.id = 'homebase';

      // The homebase is region specific so we set it here.
      $data.homebase = homebase;

      var awayCars = tempItems[1]
        .filter(isCarAccessible)
        .map(function (item) {
        if (item.hasOwnProperty('isAvailable')) {
          item.icon = 'car';
        }
        return item;
      });

      awayCars.push(homebase);
      return awayCars;
    } else {
      console.log("NO HOMEBASE");
    }
    return items;
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
      var ids = _(car.cars).filter(isCarAccessible).map('id').value();
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
      message: 'Please try again later',
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
