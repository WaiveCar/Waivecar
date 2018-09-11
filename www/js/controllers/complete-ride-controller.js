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

    var $modal = $injector.get('$modal');

    $scope.service = $ride;
    var ctrl = this;
    ctrl.dirty = true;
    ctrl.damage = true;
    ctrl.tickets = true;
    ctrl.notifyOfMovement = false;
    ctrl.data = $data.active;

    ctrl.init = init;
    ctrl.toggle = toggle;
    ctrl.onComplete = onComplete;
    ctrl.reportProblem = reportProblem;

    ctrl.init();

    //var ZendriveService = $injector.get('ZendriveService');

    function init() {
      loadBooking($stateParams.id)
        .then(function(booking) {
          ctrl.booking = booking;
          $ride.setBooking(booking.id);
          //ZendriveService.stop(booking.id);

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

    function showNote() {
      var modal;
      $modal('result', {
        title: 'Please Note',
        message: 'I am reporting this car has no known damage. If the next user reports damage that I missed, I will be held responsible for it.',
        icon: 'x-icon',
        actions: [{
          className: 'button-balanced',
          text: 'I Understand',
          handler: function () {
            modal.remove();
            complete();
          }
        }, {
          className: 'button-dark',
          text: 'I\'ll Take another look',
          handler: function () {
            modal.remove();
          }
        }]
      })
        .then(function (_modal) {
          modal = _modal;
          modal.show();
        });
    }

    function onComplete() {
      showNote();
    }

    function complete() {
      var car = $data.active.cars;

      if (car == null) {
        return null;
      }
      if (!car.isKeySecure || car.isIgnitionOn) {
        return null;
      }
      return $ride.checkAndProcessActionOnBookingEnd(ctrl.notifyOfMovement);
    }

    function reportProblem() {
      var params = {
        id: $stateParams.id,
        return: 'bookings-show',
        notifyOfMovement: ctrl.notifyOfMovement
      }
      $state.go('damage-gallery', params);
    }
  }
]);
