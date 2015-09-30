'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
var _ = require('lodash');

module.exports = angular.module('app.controllers').controller('CarController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  function ($rootScope, $scope, $state, $auth, $data, $message) {

    $scope.carDiagnostic = function (type) {
      var na = 'Unavailable';
      if (!$data.active || !$data.active.cars || !$data.active.cars.diagnostics) {
        return na;
      }

      var diagnostic = _.findWhere($data.active.cars.diagnostics, {
        type: type
      });

      if (diagnostic) {
        return diagnostic.value + diagnostic.unit;
      }

      return na;

    };

    $scope.book = function () {
      if (!$auth.isAuthenticated()) {
        return $state.go('auth', {
          redirectState: 'cars-show',
          redirectParams: {
            carId: $state.params.id
          }
        });
      }

      return $data.create('bookings', {
          carId: $state.params.id,
          userId: $auth.me.id
        })
        .then(function (booking) {
          console.log('booking', booking);
          $state.go('bookings-edit', {
            id: booking.id
          });
        })
        .catch($message.error);

    };

    $scope.init = function () {
      $data.activate('cars', $state.params.id, function (err) {
        if(err){
          return $message.error(err);
        }
        console.log('active car set to ' + $data.active.cars.id);

        // $rootScope.$broadcast(MapsEvents.destinyOnRouteChanged, $data.active.cars.location);
        //$rootScope.$broadcast(self.searchEvents.vehicleSelected, data);

      });
    };

    $scope.init();

  }

]);
