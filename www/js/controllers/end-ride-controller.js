'use strict';
var angular = require('angular');

require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/ride-service');
require('../services/geocoding-service');

module.exports = angular.module('app.controllers').controller('EndRideController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$ride',
  '$geocoding',
  '$progress',
  function ($rootScope, $scope, $state, $auth, $data, $ride, $geocoding, $progress) {

    // Concepts:
    // $scope is used to store ref. to the service and the active models in the data svc.
    // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.

    $scope.service = $ride;
    $scope.data = $data.active;

    $scope.showVideo = false;
    $scope.toggleVideo = function() {
      $scope.showVideo = !$scope.showVideo;
    };

    this.geocode = function () {
      $progress.showSimple(true);
      if (!($rootScope.currentLocation && $rootScope.currentLocation.latitude)) {
        return null;
      }
      return $geocoding($rootScope.currentLocation.latitude, $rootScope.currentLocation.longitude)
        .then(function (location) {
          $ride.state.parkingLocation.addressLine1 = location.display_name;
        })
        .finally(function () {
          $progress.hide();
        });
    };

    this.endRide = function () {
      var car = $data.active.cars;
      if (car == null) {
        return null;
      }
      if (!car.isKeySecure || car.isIgnitionOn) {
        return null;
      }
      return $ride.processEndRide();
    };

    this.init = function () {
      var rideServiceReady = $scope.$watch('service.isInitialized', function(isInitialized) {
        console.log('[end-ride] Service initialized: %s', isInitialized);
        if (isInitialized !== true) {
          return;
        }
        rideServiceReady();
        if ($state.current.name === 'end-ride-location') {
          this.geocode();
        }
        if ($state.current.name === 'end-ride') {
          $scope.service.processEndRide();
        }
      }.bind(this));
    };

    this.init();
  }
]);
