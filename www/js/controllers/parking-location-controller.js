'use strict';

var angular = require('angular');
var moment = require('moment');

require('../services/zendrive-service');

module.exports = angular.module('app.controllers').controller('ParkingLocationController', [
  '$rootScope',
  '$scope',
  '$settings',
  '$window',
  '$state',
  '$stateParams',
  '$ride',
  '$geocoding',
  '$ionicLoading',
  '$modal',
  '$uploadImage',
  'ZendriveService',
  function($rootScope, $scope, $settings, $window, $state, $stateParams, $ride, $geocoding, $ionicLoading, $modal, $uploadImage, ZendriveService) {
    $scope.service = $ride;
    // Setup scope
    var ctrl = this;

    ctrl.service = $ride;
    ctrl.type = 'street';
    ctrl.lot = {
      lotFreePeriod: false,
      lotFreeHours: null,
      lotHours: null,
      lotMinutes: null,
      lotLevel: null,
      lotSpot: null,
      lotOvernightRest: false
    };
    ctrl.street = {
      streetSignImage: null,
      streetHours: null,
      streetMinutes: null,
      streetOvernightRest: false
    };

    // Attach methods
    ctrl.setType = setType;
    ctrl.geocode = geocode;
    ctrl.submit = submit;
    ctrl.addPicture = addPicture;
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
     * @param {String} type Type of parking info
     * @returns {Void} none
     */
    function setType(type) {
      ctrl.type = type;
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

    /**
     * Uploads image to server for street sign
     * @returns {Void} null
     */
    function addPicture () {
      $uploadImage({
        endpoint: '/files?bookingId=' + $stateParams.id,
        filename: 'parking_' + $stateParams.id + '_' + Date.now() + '.jpg',
      })
      .then(function (result) {
        if (result && Array.isArray(result)) result = result[0];

        result.style = {
          'background-image': 'url(' + $settings.uri.api + '/file/' + result.id + ')'
        };
        ctrl.street.streetSignImage = result;
      })
      .catch(function (err) {
        var message = err.message;
        if (err instanceof $window.FileTransferError) {
          if (err.body) {
            var error = angular.fromJson(err.body);
            if (error.message) {
              message = error.message;
            }
          }
        }
        submitFailure(message);
      });
    };

    /**
     * Submits payload
     * @returns {Void} null
     */
    function submit() {
      var payload;

      $ionicLoading.show({
        template: '<div class="circle-loader"><span>Loading</span></div>'
      });
      // Check which type we are submitting
      if (ctrl.type === 'lot') {
        if (ctrl.lot.lotHours < 3 && !ctrl.lot.lotFreePeriod) return submitFailure('You can\'t return your WaiveCar here. The spot needs to be valid for at least 3 hours.');
        if (moment().hours() >= 21 && ctrl.lot.lotOvernightRest) return submitFailure('You can\'t return your WaiveCar here. If the car is ticketed or towed, you\'ll be responsible for the fees.');
        payload = ctrl.lot;
      } else if (ctrl.type === 'street') {
        if (ctrl.street.streetHours < 3) return submitFailure('You can\'t return your WaiveCar here. The spot needs to be valid for at least 3 hours.');
        if (moment().hours() >= 21 && ctrl.lot.streetOvernightRest) return submitFailure('You can\'t return your WaiveCar here. If the car is ticketed or towed, you\'ll be responsible for the fees.');
        payload = ctrl.street;
      }

      ZendriveService.stop();
      payload.type = ctrl.type;
      $ride.setParkingDetails(payload);
      return $ride.processEndRide().then(function() {
        $ionicLoading.hide();
        return $state.go('end-ride', { id: $ride.state.booking.id });
      });
    }

    /**
     * Displays error message
     * @param {String} message Message to display
     * @returns {Void} null
     */
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
