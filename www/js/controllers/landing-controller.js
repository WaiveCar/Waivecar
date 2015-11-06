'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/message-service');
require('../services/booking-service');

module.exports = angular.module('app.controllers').controller('LandingController', [
  '$scope',
  '$state',
  '$auth',
  '$message',
  'BookingService',
  function ($scope, $state, $auth, $message, BookingService) {

    function init() {

      if (!$auth.isAuthenticated()) {
        return $state.go('auth');
      }

      BookingService.getActiveBooking()
        .then(function(booking){
          console.log('booking', booking);

          if(!booking){
            return $state.go('cars');
          }

          switch (booking.state) {
          case 'in-progress':
            throw 'booking in-progress redirect not implemented';
          case 'pending-payment':
            throw 'booking pending-payment redirect not implemented';
          case 'new-booking':
          case 'payment-authorized':
          case 'pending-arrival':
          default:
            return $state.go('bookings-active', {
              id: booking.id
            });
          }

        })
        .catch($message.error);

    };

    init();

  }

]);
