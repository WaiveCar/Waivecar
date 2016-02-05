'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
require('../services/ride-service');
require('../services/modal-service');
require('../services/pre-book-service');

module.exports = angular.module('app.controllers').controller('CarController', [
  '$scope',
  '$state',
  '$injector',
  '$ride',
  'car',
  function ($scope, $state, $injector, $ride, car) {
    var $message = $injector.get('$message');
    var $data = $injector.get('$data');
    var $auth = $injector.get('$auth');
    var $q = $injector.get('$q');
    var $preBook = $injector.get('$preBook');

    this.car = angular.extend({}, car, { item: 'car' });
    if (this.car.isAvailable === false) {
      this.car.icon = 'unavailable';
    }

    this.book = function() {
      var model = { userId: $auth.me.id, carId: $state.params.id };
      // Create a Booking
      return $data.create('bookings', model)
      .then(function onBooking (booking) {
        return $q.all([
          // Active the created Booking so any consumer of $data can access current booking via $data.active.bookings
          $data.activate('bookings', booking.id),
          // Active the Car used in the active Booking so any consumer of $data can access current car via $data.active.cars
          $data.activate('cars', booking.carId)
        ])
        .then(function() {
          $ride.setBooking(booking.id);
          $state.go('bookings-active', { id: booking.id });
        })
        .catch($message.error);
      }, $preBook);
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
