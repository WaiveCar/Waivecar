'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
require('../services/booking-service');
var _ = require('lodash');

module.exports = angular.module('app.controllers').controller('CarController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  'BookingService',
  '$ionicModal',
  'status',
  function ($rootScope, $scope, $state, $auth, $data, $message, BookingService, $ionicModal, status) {

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

    function showRequirementsModal(_status){

      var scope = $scope.$new();
      scope.status = _status;
      scope.book = $scope.book;

      scope.numberOfOpenItems = BookingService.getNumberOfOpenItems();
      scope.hasActiveBooking = BookingService.hasActiveBooking;
      scope.activeBooking = BookingService.activeBooking;

      $ionicModal.fromTemplateUrl('/templates/bookings/modal-validation.html', {
        scope: scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        modal.show();
        scope.close = function(){
          modal.remove();
        };

        $scope.$on('$destroy', function() {
          modal.remove();
        });
      });

    }

    $scope.book = function () {
      if(BookingService.hasActiveBooking){
        return showRequirementsModal(status);
      }

      return BookingService.userCanBook($state.params.id, true)
        .then(function(userCanBook){

          if(!userCanBook){
            return showRequirementsModal(status);
          }

          return $data.create('bookings', {
              carId: $state.params.id,
              userId: $auth.me.id
            })
            .then(function (booking) {
              $state.go('bookings-edit', {
                id: booking.id
              });
            });

        })
        .catch($message.error);

      // if (!$auth.isAuthenticated()) {
      //   return $state.go('auth', {
      //     redirectState: 'cars-show',
      //     redirectParams: {
      //       carId: $state.params.id
      //     }
      //   });
      // }

    };

    $scope.init = function () {
      if($state.params.displayRequirements){
        showRequirementsModal(status);
      }

      $data.activate('cars', $state.params.id, function (err) {
        if(err){
          return $message.error(err);
        }
        console.log('active car set to ' + $data.active.cars.id);

      });
    };

    $scope.init();

  }

]);
