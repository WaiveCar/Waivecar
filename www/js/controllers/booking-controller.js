/* global window: false, L: true */
'use strict';
var angular = require('angular');
var moment = require('moment');
var sprintf = require('sprintf-js').sprintf;
var ionic = require('ionic');

require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/ride-service');
require('../services/message-service');
require('../services/modal-service');
require('../services/location-service');

module.exports = angular.module('app.controllers').controller('BookingController', [
  '$rootScope',
  '$scope',
  '$interval',
  '$state',
  '$auth',
  'LocationService',
  '$data',
  '$ride',
  '$message',
  '$modal',
  function ($rootScope, $scope, $interval, $state, $auth, LocationService, $data, $ride, $message, $modal) {

    $scope.image = 'img/car.jpg';
    $scope.showVideo = false;

    // $scope is used to store ref. to $ride and the active models in $data.
    $scope.service = $ride;

    // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
    $scope.data = $data.active;
    $scope.cache = $data.instances;

    var timer = $interval(function() {
      if ($scope.expired) {
        var time = moment($scope.expired).toNow(true);
        $scope.timeLeft = time;
        console.log(time);
      }
    }, 1000);

    $scope.mockInRange = function () {
      LocationService.setLocation($scope.data.cars);
    };

    $scope.mockOutOfRange = function () {
      var mock = {
        latitude: 34.0604643,
        longitude: -118.4186743
      };

      LocationService.setLocation(mock);
      $scope.watchForWithinRange();
    };

    $scope.watchForWithinRange = function () {
      var stopWatching = $scope.$watch(function () {
        if (!$rootScope.currentLocation) {
          return false;
        }

        var from = L.latLng($rootScope.currentLocation.latitude, $rootScope.currentLocation.longitude);
        var to = L.latLng($data.active.cars.latitude, $data.active.cars.longitude);
        var distance = from.distanceTo(to);
        return distance <= 35;
      }, function (newValue) {
        if (newValue) {
          stopWatching();
          $scope.showUnlock();
        }
      });
    };

    $scope.showUnlock = function() {
      $modal('result', {
        title: 'You\'re In Reach',
        message: 'Now you can unlock your WaiveCar!',
        icon: 'x-icon',
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
            }.bind(this)).catch(function(err) {
              $message.error(err);
              this.modal.hide();
              $scope.showRetry();
            });
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

    this.start = function() {
      var id = $ride.state.booking.id;
      $data.resources.bookings.start({ id: id }).$promise.then(function() {
        $data.fetch('bookings');
        $state.go('dashboard');
      }).catch($message.error);
    };

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
        window.open(encodeURI(url), '_system');
      } else {
        url = 'http://maps.google.com/maps?saddr=%(startingLat)s,%(startingLon)s&daddr=%(targetLat)s,%(targetLon)s&mode=walking';
        url = sprintf(url, sprintfOptions);
        window.open(url);
      }
    };

    this.init = function () {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }

      if ($state.current.name === 'bookings-active') {
        var rideServiceReady = $scope.$watch('service.isInitialized', function(isInitialized) {
          if (isInitialized === true) {
            rideServiceReady();
            $scope.watchForWithinRange();
            $scope.expired = moment($scope.data.bookings.createdAt).add(15, 'm');
            $scope.image = $data.active.cars.fileId || 'img/car.jpg';
          }
        });
      }
    };

    this.init();

  }

]);
