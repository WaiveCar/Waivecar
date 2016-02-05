'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');

module.exports = angular.module('app.controllers').controller('BookingPrepareController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  function ($rootScope, $scope, $state, $auth, $data, $message) {

    $scope.inspect = function () {
      // TODO: show booking-inspection modal.
      $message.error('problem reported');

    };

    $scope.init = function () {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }

      $data.activate('bookings', $state.params.id, function (err) {
        if(err){
          return $message.error(err);
        }

        if ($data.active.bookings.state === 'in-progress') {
          $state.go('bookings-in-progress', {
            id: $data.active.bookings.id
          });
          return false;
        }

        var booking = angular.copy($data.active.bookings);
        booking.state = 'start';

        $data.update('bookings', booking, function (_err) {
          if (_err) {
            return $message.error(err);
          }

          var connected = $scope.$watch(function () {
            console.log($data.active.bookings.state);
            return $data.active.bookings.state === 'in-progress';
          }, function () {
            if ($data.active.bookings.state === 'in-progress') {
              connected();
              $state.go('bookings-in-progress', {
                id: $data.active.bookings.id
              });
            }
          });


          // TODO: b) TRIGGER CALL TO UNLOCK CAR
          // TODO: c) TRIGGER CALL TO ENABLE START
          // (b. & c. may be automatically triggered via a.)
        });
      });
    };

    $scope.init();
  }
]);
