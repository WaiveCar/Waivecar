/* global window: false, L: true */
'use strict';
var angular = require('angular');
var _ = require('lodash');
var moment = require('moment');

require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/ride-service');
require('../services/message-service');
require('../services/modal-service');

module.exports = angular.module('app.controllers').controller('BookingController', [
  '$rootScope',
  '$scope',
  '$interval',
  '$state',
  '$auth',
  'MockLocationService',
  '$data',
  '$ride',
  '$message',
  '$modal',
  function ($rootScope, $scope, $interval, $state, $auth, LocationService, $data, $ride, $message, $modal) {

    // Concepts:
    // $scope is used to store ref. to the service and the active models in the data svc.
    // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
    // Controller is reused by Sanpit and all End Ride views as there is a lot of crossover, but they could each have their own.
    // TEMP FOR SANDPIT section has the calls required for the Start ride flow. These relate to the buttons on the Sandpit view.

    $scope.service = $ride;
    $scope.data = $data.active;

    $interval(function() {
      if (this.expired) {
        $scope.timeLeft = moment(this.expired).toNow(true);
      }
    }.bind(this), 1000);

    $scope.mockInRange = function () {
      LocationService.setLocation($scope.data.cars);
    };

    $scope.mockOutOfRange = function () {
      LocationService.setLocation();
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
        return distance <= 25;
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
            var id = $ride.state.booking.id;
            $data.resources.bookings.ready({ id: id }).$promise.then(function() {
              $data.fetch('bookings').then(function() {
                this.modal.hide();
                console.log('asd');
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
        }]
      }).$promise.then(function (modal) {
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

    // this.cancel = function() {
    //   return $q(function (resolve, reject) {
    //     var id = $ride.state.booking.id;
    //     $data.remove('bookings', id).then(function() {
    //       $message.success(id + ' has been successfully cancelled');
    //       $ride.setState();
    //       $data.deactivate('cars');
    //       $data.deactivate('bookings');
    //       return resolve();
    //     }).catch(function() {
    //       $message.error);
    //     }
    // };

    // this.ready = function() {
    //   var id = $ride.state.booking.id;
    //   return $data.resources.bookings.ready({ id: id }).$promise.then(function() {
    //     return $data.fetch('bookings');
    //   }).catch($message.error);
    // };

    this.start = function() {
      debugger;
      var id = $ride.state.booking.id;
      $data.resources.bookings.start({ id: id }).$promise.then(function() {
        $data.fetch('bookings');
        $state.go('dashboard');
      }).catch($message.error);
    };

    this.init = function () {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }

      $scope.showVideo = true;

      if ($state.current.name === 'bookings-active') {
        var rideServiceReady = $scope.$watch('service.isInitialized', function(isInitialized) {
          if (isInitialized === true) {
            rideServiceReady();
            $scope.watchForWithinRange();
            $scope.image = $data.active.cars.fileId || 'img/car.jpg';
          }
        });
      }
    };

    //   // reset ride state.
    //   $scope.service.setState();

    //   $data.initialize('cars').then(function() {
    //     console.log('cars initialized');
    //   }).catch($message.error);

    //   $data.initialize('bookings').then(function() {
    //     console.log('bookings initialized');
    //     if ($data.instances.bookings.length > 0) {
    //       var current = _.find($data.instances.bookings, function(b) {
    //         return !_.contains([ 'cancelled', 'ended' ], b.status);
    //       });
    //       if (current) {
    //         $scope.service.setBooking(current.id);
    //         $data.activate('bookings', current.id);
    //         this.expired = moment($scope.data.bookings.createdAt).add(15, 'm');
    //         $data.activate('cars', current.carId);
    //         $scope.watchForWithinRange();
    //         $scope.image = $data.active.cars.fileId || 'img/car.jpg';
    //         if ($state.current.name === 'end-ride') {
    //           $scope.service.processEndRide();
    //         }
    //       } else {
    //       }
    //     } else {
    //     }
    //   }.bind(this)).catch($message.error);
    // }.bind(this);

    this.init();

  }

]);
