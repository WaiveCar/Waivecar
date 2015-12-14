'use strict';
var angular = require('angular');
var _ = require('lodash');

require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/end-ride-service');
require('../services/message-service');

module.exports = angular.module('app.controllers').controller('EndRideController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$endRide',
  '$message',
  function ($rootScope, $scope, $state, $auth, $data, $endRide, $message) {

    $scope.service = $endRide;
    $scope.data = $data.active;

    // TEMP FOR SANDPIT **********************************************************************
    this.create = function() {
      var tempModel = { userId: $auth.me.id, carId: 'E5000017DC1E8A01' };
      $data.create('bookings', tempModel).then(function(booking) {
        $data.activate('bookings', booking.id);
        $data.activate('cars', booking.carId);
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
              //$scope.service.processEndRide();
            }
          } else {
            // temp, should go back to Find Cars maybe...
            //$state.go('sandpit');
          }
        } else {
          // temp, should go back to Find Cars maybe...
          //$state.go('sandpit');
        }
      }).catch($message.error);
    };

    this.init();

  }

]);
