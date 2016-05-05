'use strict';

var angular = require('angular');
var moment = require('moment');

module.exports = angular.module('app.controllers').controller('ParkingLocationController', [
  '$rootScope',
  '$scope',
  '$state',
  '$ride',
  '$geocoding',
  '$ionicLoading',
  '$modal',
  function($rootScope, $scope, $state, $ride, $geocoding, $ionicLoading, $modal) {
    $scope.service = $ride;
    // Setup scope
    var ctrl = this;

    ctrl.service = $ride;
    ctrl.type = 'lot';
    ctrl.lot = {
      lotFreePeriod: false,
      lotFreeHours: 0,
      lotHours: 0,
      lotMinutes: 0,
      lotLevel: 0,
      lotSpot: 0,
      lotOvernightRest: false
    };
    ctrl.street = {

    };

    // Attach methods
    ctrl.toggleType = toggleType;
    ctrl.geocode = geocode;
    ctrl.submit = submit;
    ctrl.init = init;

    // Kickoff
    ctrl.init();

    /**
     * Initialize controller
     * @returns {Void} none
     */
    function init() {
      // Wait for service to initialize
      var rideServiceReady = $scope.$watch('service.isInitialized', function(isInitialized) {
        console.log('[end-ride] Service initialized: %s', isInitialized);
        if (isInitialized !== true) {
          return;
        }
        rideServiceReady();

        // Kick off geocoding
        ctrl.geocode();
      });
    }

    /**
     * Toggle parking type
     * @returns {Void} none
     */
    function toggleType() {
      if (ctrl.type === 'lot') ctrl.type = 'street';
      else if (ctrl.type === 'street') ctrl.type = 'lot';
    }

    /**
     * Fetch geocode info for display
     * @returns {Void} none
     */
    function geocode() {
      if (!($rootScope.currentLocation && $rootScope.currentLocation.latitude)) {
        return null;
      }
      return $geocoding($rootScope.currentLocation.latitude, $rootScope.currentLocation.longitude)
        .then(function (location) {
          $ride.state.parkingLocation.addressLine1 = location.display_name;
          ctrl.address = location.address;
        })
        .catch(function(err) {
          console.log('geocode failed: ', err);
        })
        .finally(function () {
          $ionicLoading.hide();
        });
    }

    function submit() {
      // Check which type we are submitting
      if (ctrl.type === 'lot') {
        if (ctrl.lot.lotHours < 3 && !ctrl.lot.lotFreePeriod) return submitFailure('You can\'t return your WaiveCar here. The spot needs to be valid for at least 3 hours.');
        if (moment().hours() < 21 && ctrl.lot.lotOvernightRest) return submitFailure('You can\'t return your WaiveCar here. If the car is ticketed or towed, you\'ll be responsible for the fees.');
      } else if (ctrl.type === 'street') {

      }
      return null;
    }

    function submitFailure(message) {
      $ionicLoading.hide();
      var endRideModal;

      $modal('result', {
        icon: 'x-icon',
        title: message,
        actions: [{
          text: 'Ok',
          className: 'button-balanced',
          handler: function () {
            endRideModal.remove();
          }
        }]
      })
      .then(function (_modal) {
        _modal.show();
        endRideModal = _modal;
        endRideModal.show();
      });
    }
  }
]);
