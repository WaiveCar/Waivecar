'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
require('../services/booking-service');

module.exports = angular.module('app.controllers').controller('CarController', [
  '$rootScope',
  '$scope',
  '$state',
  '$injector',
  'status',
  'car',
  function ($rootScope, $scope, $state, $injector, status, car) {
    var BookingService = $injector.get('BookingService');
    var $ionicModal = $injector.get('$ionicModal');
    var $message = $injector.get('$message');
    var $data = $injector.get('$data');
    var $auth = $injector.get('$auth');

    if ($state.params.displayRequirements) {
      showRequirementsModal(status);
    }

    this.car = angular.extend({}, car, {item: 'car'});

    function showRequirementsModal (_status) {

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

    this.book = function book () {
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
              $state.go('bookings-active', {
                id: booking.id
              });
            });

        })
        .catch($message.error);

    };
  }

]);
