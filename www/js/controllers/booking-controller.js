'use strict';
var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');

require('angular-ui-router');
require('../services/data-service');
require('../services/ride-service');
require('../services/message-service');
require('../services/modal-service');

module.exports = angular.module('app.controllers').controller('BookingController', [
  '$scope',
  '$rootScope',
  '$injector',
  function ($scope, $rootScope, $injector) {
    var $ride = $injector.get('$ride');
    var $data = $injector.get('$data');
    var $distance = $injector.get('$distance');
    var $modal = $injector.get('$modal');
    var $state = $injector.get('$state');
    var $message = $injector.get('$message');

    $scope.image = 'img/car.jpg';
    $scope.distance = 'Unknown';

    $scope.showVideo = false;
    $scope.toggleVideo = function() {
      $scope.showVideo = !$scope.showVideo;
    };

    // $scope is used to store ref. to $ride and the active models in $data.
    $scope.service = $ride;

    // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
    $scope.data = $data.active;
    $scope.cache = $data.instances;
    $scope.featured = featured($data.instances.locations);

    function featured (items) {
      return _(items)
        .sortBy(function (item) {
          if ($rootScope.currentLocation) {
            return $distance.getDistance(item);
          }
          return item.id;
        })
        .take(2)
        .value();
    }

    $scope.openPopover = function(item) {
      $scope.selectedItem = item;
      $scope.showItem = true;
      return true;
    };
    $scope.closePopover = function() {
      $scope.showItem = false;
      $scope.selectedItem = null;
    };

    this.start = function () {
      $data.fetch('bookings');
      $state.go('dashboard');
    };

    this.lockCar = function (id) {
      $ride.lockCar(id)
        .catch(function (reason) {
          if (reason && reason.code === 'IGNITION_ON') {
            showIngitionOnModal();
            return;
          }
          $message.error(reason);
        });
    };

    this.endRide = function (carId, bookingId) {
      return $ride.isCarOn(carId)
        .then(function (isCarOn) {
          if (isCarOn) {
            showIngitionOnModal();
            return;
          }
          $state.go('end-ride-options', {id: bookingId});
        });
    };

    function showIngitionOnModal () {
      var ignitionOnModal;
      $modal('result', {
        icon: 'x-icon',
        title: 'Please turn the car off',
        actions: [{
          text: 'Ok',
          className: 'button-balanced',
          handler: function () {
            ignitionOnModal.remove();
          }
        }]
      })
      .then(function (_modal) {
        ignitionOnModal = _modal;
        ignitionOnModal.show();
      });
    }

    this.init = function () {
      var rideServiceReady = $scope.$watch('service.isInitialized', function(isInitialized) {
        if (isInitialized === true) {
          rideServiceReady();
          if ($state.current.name === 'dashboard') {
            if ($scope.data.bookings && $scope.data.bookings.details.length) {
              $scope.timeLeft = moment($scope.data.bookings.details[0].time).add(90, 'm').toNow(true);
            }
          }
        }
      });
    };

    this.init();

  }

]);
