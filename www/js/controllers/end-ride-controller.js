'use strict';
var angular = require('angular');
var _ = require('lodash');

require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/ride-service');
require('../services/message-service');

module.exports = angular.module('app.controllers').controller('EndRideController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$ride',
  '$message',
  function ($rootScope, $scope, $state, $auth, $data, $ride, $message) {

    // Concepts:
    // $scope is used to store ref. to the service and the active models in the data svc.
    // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
    // Controller is reused by Sanpit and all End Ride views as there is a lot of crossover, but they could each have their own.
    // TEMP FOR SANDPIT section has the calls required for the Start ride flow. These relate to the buttons on the Sandpit view.

    $scope.service = $ride;
    $scope.data = $data.active;

    // TEMP FOR SANDPIT **********************************************************************
    this.create = function() {
      var tempModel = { userId: $auth.me.id, carId: 'EE000017DC380D01' }; //DB000017DC73EA01' };
      // Create a Booking
      $data.create('bookings', tempModel).then(function(booking) {
        // Active the created Booking so any consumer of $data can access current booking via $data.active.bookings
        $data.activate('bookings', booking.id);
        // Active the Car used in the active Booking so any consumer of $data can access current car via $data.active.cars
        $data.activate('cars', booking.carId);
        // Set the $endRide service's ref to the booking id.
        $scope.service.setBooking(booking.id);
      }).catch($message.error);
    };
    this.cancel = function() {
      var id = $scope.service.state.booking.id;
      $data.remove('bookings', id).then(function() {
        $message.success(id + ' has been successfully cancelled');
        $scope.service.setState();
        $data.deactivate('cars');
        $data.deactivate('bookings');
      }).catch($message.error);
    };
    this.ready = function() {
      var id = $scope.service.state.booking.id;
      $data.resources.bookings.ready({ id: id }).$promise.then(function() {
        $data.fetch('bookings');
      }).catch($message.error);
    };
    this.start = function() {
      var id = $scope.service.state.booking.id;
      $data.resources.bookings.start({ id: id }).$promise.then(function() {
        $data.fetch('bookings');
      }).catch($message.error);
    };
    // END TEMP ******************************************************************************



    this.init = function () {
      if ($state.current.name === 'end-ride-options') {
        // reset end ride state.
        $scope.service.setState();
      }

      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }

      $data.initialize('cars').then(function() {
        console.log('cars initialized');
      }).catch($message.error);

      $data.initialize('bookings').then(function() {
        console.log('bookings initialized');
        if ($data.instances.bookings.length > 0) {
          var current = _.find($data.instances.bookings, function(b) {
            return !_.contains([ 'cancelled', 'ended' ], b.status);
          });
          if (current) {
            $scope.service.setBooking(current.id);
            $data.activate('bookings', current.id);
            $data.activate('cars', current.carId);
            if ($state.current.name === 'end-ride') {
              $scope.service.processEndRide();
            }
          } else {
            // temp, should go back to Find Cars maybe...
            $state.go('sandpit');
          }
        } else {
          // temp, should go back to Find Cars maybe...
          $state.go('sandpit');
        }
      }).catch($message.error);
    };

    this.init();

  }

]);
