'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');

module.exports = angular.module('app.controllers').controller('BookingInProgressController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  function ($rootScope, $scope, $state, $auth, $data, $message) {

    $scope.end = function () {
      var booking = angular.copy($data.active.bookings);
      booking.state = 'end';
      $data.update('bookings', booking, function (err) {
        if (err) {
          return $message.error(err.message || err);
        }
        $state.go('bookings-show', {
          id: $data.active.bookings.id
        });

      });
    };

    $scope.init = function () {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }

      $data.activate('bookings', $state.params.id, function (err) {
        if(err){
          return $message.error(err);
        }
        $data.activate('cars', $data.active.bookings.carId, function (_err) {
          if(_err){
            return $message.error(_err);
          }


        });
      });
    };

    $scope.init();

  }

]);
