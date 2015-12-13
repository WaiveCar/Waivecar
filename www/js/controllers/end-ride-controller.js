'use strict';
var angular = require('angular');
var _ = require('lodash');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
require('../services/end-ride-service');

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

    //TEMP FOR SANDPIT
    $scope.create = function() {
      var tempModel = { userId: $auth.me.id, carId: 'E5000017DC1E8A01' };
      $data.create('bookings', tempModel).then(function(booking) {
        $data.activate('bookings', booking.id);
        $data.activate('cars', booking.carId);
        $scope.service.setBooking(booking.id);
      }).catch($message.error);
    };

    //TEMP FOR SANDPIT
    $scope.cancel = function() {
      var id = $scope.service.state.booking.id;
      $data.remove('bookings', id).then(function() {
        $message.success(id + ' has been successfully cancelled');
        $scope.service.setState();
        $data.deactivate('cars');
        $data.deactivate('bookings');
      }).catch($message.error);
    };

    //TEMP FOR SANDPIT
    $scope.ready = function() {
      $data.resources.bookings.ready({ id: $scope.service.state.booking.id }).$promise.then(function(booking) {
        $data.fetch('bookings');
      }).catch($message.error);
    };

    //TEMP FOR SANDPIT
    $scope.start = function() {
      $data.resources.bookings.start({ id: $scope.service.state.booking.id }).$promise.then(function(booking) {
        $data.fetch('bookings');
      }).catch($message.error);
    };

    $scope.init = function () {
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
          }
        }
      }).catch($message.error);
    };

    $scope.init();

  }

]);
