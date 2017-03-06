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
    var $ionicLoading = $injector.get('$ionicLoading');
    var $cordovaAppVersion = $injector.get('$cordovaAppVersion'); 
    var appVersion = false;
    $cordovaAppVersion.getVersionCode().then(function (version) {
      appVersion = version;
    });


    var LocationService = $injector.get('LocationService');
    // the accuracy should be within this amount of meters to show the Bummer dialog
    var minAccuracyThreshold = 200;
    var modal;

    LocationService.getCurrentLocation()
      .then(function (latlon) {
        this.location = latlon;
        this.route = {
          start: this.location,
          destiny: car
        };

      }.bind(this)
    );

    this.car = angular.extend({}, car, { item: 'car' });
    if (this.car.isAvailable === false) {
      this.car.icon = 'unavailable';
    }

    this.markers = [car];



    this.book = function() {
      var model = { version: appVersion, userId: $auth.me.id, carId: $state.params.id };

      $ionicLoading.show({
        template: '<div class="circle-loader"><span>Loading</span></div>'
      });

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
          $ionicLoading.hide();
          $ride.setBooking(booking.id);
          $state.go('bookings-active', { id: booking.id });
        })
        .catch($message.error);
      }, $preBook);
    };

    this.cancel = function() {
      var id = $scope.service.state.booking.id;

      $ionicLoading.show({
        template: '<div class="circle-loader"><span>Loading</span></div>'
      });

      $data.remove('bookings', id).then(function() {
        $ionicLoading.hide();
        $message.success(id + ' has been successfully cancelled');
        $scope.service.setState();
        $data.deactivate('cars');
        $data.deactivate('bookings');
        $state.go('cars');
      }).catch($message.error);
    };

  }

]);
