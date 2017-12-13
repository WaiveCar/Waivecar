'use strict';

var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');

module.exports = angular.module('app.controllers').controller('CompleteRideController', [
  '$scope',
  '$stateParams',
  '$state',
  '$ride',
  '$data',
  '$injector',
  function ($scope, $stateParams, $state, $ride, $data, $injector) {

    $scope.service = $ride;
    var ctrl = this;
    ctrl.dirty = false;
    ctrl.damage = false;
    ctrl.tickets = false;
    ctrl.data = $data.active;

    ctrl.init = init;
    ctrl.toggle = toggle;
    ctrl.complete = complete;
    ctrl.reportProblem = reportProblem;

    ctrl.init();

    var ZendriveService = $injector.get('ZendriveService');

    function init() {
      loadBooking($stateParams.id)
        .then(function(booking) {
          ctrl.booking = booking;
          $ride.setBooking(booking.id);
          ZendriveService.stop(booking.id);

          var start = _.find(booking.details, { type: 'start' });
          var end = _.find(booking.details, { type: 'end' });

          ctrl.hours = moment(end.createdAt).diff(moment(start.createdAt), 'hours');
          ctrl.minutes = moment(end.createdAt).diff(moment(start.createdAt), 'minutes');
          ctrl.minutes = ("" + (100 + ctrl.minutes % 60)).slice(1);

          return loadCar(booking.carId);
        })
        .then(function(car) {
          ctrl.car = car;
        })
        .catch(function(err) {
          console.log('init failed: ', err);
        });
    }

    function loadBooking(id) {
      return $data.resources.bookings.get({ id: id }).$promise;

      // return $data.activate('bookings', id);
    }

    function loadCar(id) {
      return $data.activate('cars', id);
    }

    function toggle(field) {
      this[field] = !this[field];
    }

    function complete() {
      var car = $data.active.cars;

      if (car == null) {
        return null;
      }
      if (!car.isKeySecure || car.isIgnitionOn) {
        return null;
      }

      return $ride.checkAndProcessActionOnBookingEnd();
    }

    function reportProblem() {
      $state.go('damage-gallery', { id: $stateParams.id, return: 'bookings-show' }, { location: 'replace' });
    }
  }
]);
