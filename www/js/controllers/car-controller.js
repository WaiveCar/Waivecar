'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
// require('../services/booking-service');
require('../services/ride-service');
require('../services/modal-service');

module.exports = angular.module('app.controllers').controller('CarController', [
  '$rootScope',
  '$scope',
  '$state',
  '$injector',
  '$ride',
  'car',
  function ($rootScope, $scope, $state, $injector, $ride, car) {
    // var BookingService = $injector.get('BookingService');
    var $ionicModal = $injector.get('$ionicModal');
    var $message = $injector.get('$message');
    var $data = $injector.get('$data');
    var $auth = $injector.get('$auth');
    var $modal = $injector.get('$modal');
    // if ($state.params.displayRequirements) {
    //   showRequirementsModal(status);
    // }

    this.car = angular.extend({}, car, { item: 'car' });

    function showRequirementsModal (_status) {

      var scope = $scope.$new();
      scope.status = _status;
      scope.book = $scope.book;

      // scope.numberOfOpenItems = BookingService.getNumberOfOpenItems();
      // TODO: this was failing so hard coded to false for now
      // scope.hasActiveBooking = false; // BookingService.hasActiveBooking;
      // end TODO
      // scope.activeBooking = BookingService.activeBooking;

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

    // this.book = function book() {
    //   if(BookingService.hasActiveBooking){
    //     return showRequirementsModal(status);
    //   }

    //   return BookingService.userCanBook($state.params.id, true)
    //     .then(function(userCanBook){

    //       if(!userCanBook){
    //         return showRequirementsModal(status);
    //       }

    //       return $data.create('bookings', {
    //           carId: $state.params.id,
    //           userId: $auth.me.id
    //         })
    //         .then(function (booking) {
    //           $state.go('bookings-active', {
    //             id: booking.id
    //           });
    //         });

    //     })
    //     .catch($message.error);
    // };

    function formatArray(arr) {
      switch (arr.length) {
        case 1: return arr[0];
        case 2: return arr.join(' and ');
        default: return arr.slice(0, -1).join(', ') + ', and ' + arr.slice(-1);
      }
    }

    this.book = function() {
      var model = { userId: $auth.me.id, carId: $state.params.id };
      // Create a Booking
      $data.create('bookings', model).then(function(booking) {
        // Active the created Booking so any consumer of $data can access current booking via $data.active.bookings
        $data.activate('bookings', booking.id).then(function() {
          // Active the Car used in the active Booking so any consumer of $data can access current car via $data.active.cars
          $data.activate('cars', booking.carId).then(function() {
            // Set the $endRide service's ref to the booking id.
            $ride.setBooking(booking.id);
            $state.go('bookings-active', { id: booking.id });
          }).catch($message.error);
        }).catch($message.error);
      }).catch(function(err) {
        var modal;
        var message = (err.data && err.data.data && err.data.data.required)
            ? 'You still need to verify your ' + formatArray(err.data.data.required) + ' before you can book a WaiveCar.'
            : err;
        $modal('result', {
          icon: 'x-icon',
          title: 'Missing Required Information',
          message: message,
          actions: [{
            className: 'button-balanced',
            text: 'OK',
            handler: function () {
              modal.remove();
            }
          }]
        }).then(function (_modal) {
          modal = _modal;
          modal.show();
        });
      });
    };

    this.cancel = function() {
      var id = $scope.service.state.booking.id;
      $data.remove('bookings', id).then(function() {
        $message.success(id + ' has been successfully cancelled');
        $scope.service.setState();
        $data.deactivate('cars');
        $data.deactivate('bookings');
        $state.go('cars');
      }).catch($message.error);
    };

  }

]);
