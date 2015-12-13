'use strict';
var angular = require('angular');
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
