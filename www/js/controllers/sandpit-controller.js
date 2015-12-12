'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');

module.exports = angular.module('app.controllers').controller('SandpitController', [
  '$rootScope',
  '$scope',
  '$ionicModal',
  '$state',
  '$auth',
  '$data',
  '$message',
  function ($rootScope, $scope, $ionicModal, $state, $auth, $data, $message) {

    $scope.outsideZone = false;
    $scope.outsideZoneConfirmed = false;

    $scope.toggleZone = function() {
      $scope.outsideZoneConfirmed = false;
      $scope.outsideZone = !$scope.outsideZone;
    };

    $scope.state = {
      location: {
        chargingStation: false,
        homebase: false,
        valet: false,
        other: false
      },
      check: {
        key: true,
        ignition: true,
        chargeCard: true,
        charging: true
      }
    };

    $scope.endWithZoneFee = function() {
      $scope.outsideZoneConfirmed = true;
    };

    $scope.endAtChargingStation = function() {
      $scope.state.location.chargingStation = true;
      $scope.endRideLocation();
    };

    $scope.endAtHomebase = function() {
      $scope.state.location.homebase = true;
      $scope.endRideLocation();
    };

    $scope.endAtValet = function() {
      $scope.state.location.valet = true;
      $scope.endRideLocation();
    };

    $scope.endAtOther = function() {
      $scope.state.location.other = true;
      $scope.endRideLocation();
    };

    $scope.endRideLocation = function() {
      $scope.closeEndRideOptions();
      $ionicModal.fromTemplateUrl('/templates/bookings/modal-end-ride-location.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        modal.show();
        $scope.closeEndRideLocation = function() {
          modal.remove();
        };
        $scope.$on('$destroy', function() {
          modal.remove();
        });
      });
    };

    $scope.endRideOptions = function() {
      $ionicModal.fromTemplateUrl('/templates/bookings/modal-end-ride-options.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        modal.show();
        $scope.closeEndRideOptions = function() {
          modal.remove();
        };
        $scope.$on('$destroy', function() {
          modal.remove();
        });
      });
    };

    $scope.endRide = function () {
      debugger;
      $scope.closeEndRideLocation();
      $ionicModal.fromTemplateUrl('/templates/bookings/modal-end-ride.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        modal.show();
        $scope.closeEndRide = function() {
          modal.remove();
        };
        $scope.$on('$destroy', function() {
          modal.remove();
        });
      });



      // var booking = angular.copy($data.active.bookings);
      // booking.state = 'end';
      // $data.update('bookings', booking, function (err) {
      //   if (err) {
      //     return $message.error(err.message || err);
      //   }
      //   $state.go('bookings-show', {
      //     id: $data.active.bookings.id
      //   });

      // });
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
