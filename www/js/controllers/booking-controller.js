'use strict';
var angular = require('angular');
var moment = require('moment');
var sprintf = require('sprintf-js').sprintf;
var ionic = require('ionic');
var _ = require('lodash');

require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/ride-service');
require('../services/message-service');
require('../services/modal-service');
require('../services/location-service');

module.exports = angular.module('app.controllers').controller('BookingController', [
  '$scope',
  '$rootScope',
  '$injector',
  function ($scope, $rootScope, $injector) {
    var $ride = $injector.get('$ride');
    var $data = $injector.get('$data');
    var $distance = $injector.get('$distance');
    var $interval = $injector.get('$interval');
    var $modal = $injector.get('$modal');
    var $state = $injector.get('$state');
    var $message = $injector.get('$message');
    var $cordovaInAppBrowser = $injector.get('$cordovaInAppBrowser');

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

    var timer = $interval(function() {
      if ($scope.expired) {
        var time = moment($scope.expired).toNow(true);
        $scope.timeLeft = time;
      }
    }, 1000);

    $scope.watchForWithinRange = function () {
      var stopWatching = $rootScope.$watch('currentLocation', function (value) {
        if (value == null) {
          return;
        }
        var distance = $distance($data.active.cars);
        if (_.isFinite(distance)) {
          // convert miles to yards
          $scope.distance = distance / 1760;
        }
        if (distance <= 35) {
          stopWatching();
          $scope.showUnlock();
        }
      });
    };

    $scope.showUnlock = function() {
      $modal('result', {
        title: 'You\'re In Reach',
        message: 'Now you can unlock your WaiveCar!',
        icon: 'check-icon',
        actions: [{
          className: 'button-balanced',
          text: 'Unlock',
          handler: function () {
            $interval.cancel(timer);
            var id = $ride.state.booking.id;
            $data.resources.bookings.ready({ id: id }).$promise.then(function() {
              $data.fetch('bookings').then(function() {
                this.modal.hide();
                $state.go('start-ride', { id: id });
              }.bind(this));
            }.bind(this)).catch(function(err) {
              $message.error(err);
              this.modal.hide();
              $scope.showRetry();
            });
          }.bind(this)
        }, {
          className: 'button-dark',
          text: 'Cancel Booking',
          handler: function () {
            this.modal.hide();
            $scope.showCancel();
          }.bind(this)
        }]
      }).then(function (modal) {
        this.modal = modal;
        modal.show();
      }.bind(this));
    };

    $scope.showRetry = function() {
      $modal('result', {
        title: 'Connection Failed',
        message: 'We couldn\'t connect to the server. If the problem persists call (323) 347-7858.',
        icon: 'x-icon',
        actions: [{
          className: 'button-balanced',
          text: 'Retry',
          handler: function () {
            $scope.showUnlock();
          }
        }]
      }).$promise.then(function (modal) {
        this.modal = modal;
        modal.show();
      }.bind(this));
    };

    $scope.showCancel = function() {
      $interval.cancel(timer);
      $modal('result', {
        title: 'Cancel Booking',
        message: 'Are you sure you want to cancel your booking?',
        icon: 'x-icon',
        actions: [{
          className: 'button-assertive',
          text: 'Yes',
          handler: function () {
            $interval.cancel(timer);
            var id = $ride.state.booking.id;
            $data.remove('bookings', id).then(function() {
              $message.success('Your Booking has been successfully cancelled');
              $data.deactivate('cars');
              $data.deactivate('bookings');
              $ride.setState();
              this.modal.hide();
              $state.go('cars');
            }.bind(this))
            .catch(function(err) {
              $message.error(err);
              this.modal.hide();
              $scope.showRetry();
            }.bind(this));
          }.bind(this)
        }, {
          className: 'button-dark',
          text: 'No',
          handler: function () {
            this.modal.remove();
            $scope.watchForWithinRange();
          }.bind(this)
        }]
      }).then(function (modal) {
        this.modal = modal;
        modal.show();
      }.bind(this));
    };

    $scope.openPopover = function(item) {
      $scope.selectedItem = item;
      $scope.showItem = true;
      return true;
    };
    $scope.closePopover = function() {
      $scope.showItem = false;
      $scope.selectedItem = null;
    };

    this.start = function() {
      var id = $ride.state.booking.id;
      $data.resources.bookings.start({ id: id }).$promise.then(function() {
        $data.fetch('bookings');
        $state.go('dashboard');
      }).catch($message.error);
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

    $scope.getDirections = function () {
      var url;
      var sprintfOptions = {
        startingLat: $rootScope.currentLocation.latitude,
        startingLon: $rootScope.currentLocation.longitude,
        targetLat: $data.active.cars.latitude,
        targetLon: $data.active.cars.longitude
      };

      if (ionic.Platform.isWebView()) {
        url = [
          'comgooglemaps-x-callback://?',
          '&saddr=%(startingLat)s,%(startingLon)s',
          '&daddr=%(targetLat)s,%(targetLon)s',
          '&directionsmode=walking',
          '&x-success=WaiveCar://?resume=true',
          '&x-source=WaiveCar'
        ].join('');
        url = sprintf(url, sprintfOptions);
        $cordovaInAppBrowser.open(encodeURI(url), '_system');
      } else {
        url = 'http://maps.google.com/maps?saddr=%(startingLat)s,%(startingLon)s&daddr=%(targetLat)s,%(targetLon)s&mode=walking';
        url = sprintf(url, sprintfOptions);
        $cordovaInAppBrowser.open(url);
      }
    };

    this.init = function () {
      var rideServiceReady = $scope.$watch('service.isInitialized', function(isInitialized) {
        if (isInitialized === true) {
          rideServiceReady();
          if ($state.current.name === 'bookings-active') {
            $scope.watchForWithinRange();
            $scope.expired = moment($scope.data.bookings.createdAt).add(15, 'm');
            $scope.image = $data.active.cars.fileId || 'img/car.jpg';
          }
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
