'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/message-service');
require('../services/booking-service');

function LandingController ($injector) {
  var $state = $injector.get('$state');
  var $auth = $injector.get('$auth');
  var $message = $injector.get('$message');
  var BookingService = $injector.get('BookingService');

  if (!$auth.isAuthenticated()) {
    return $state.go('auth');
  }

  BookingService.getActiveBooking()
  .then(function(booking){
    if (!booking) {
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
}

module.exports = angular.module('app.controllers').controller('LandingController', [
  '$injector',
  LandingController
]);
