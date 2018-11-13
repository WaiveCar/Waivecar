'use strict';
var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');

require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');

module.exports = angular.module('app.controllers').controller('BookingSummaryController', [
  '$state',
  '$auth',
  '$data',
  '$message',
  'IntercomService',
  function ($state, $auth, $data, $message, IntercomService) {

    var ctrl = this;

    ctrl.init = function () {
      $data.resources.bookings.get({ id: $state.params.id }).$promise.then(function(booking) {
        ctrl.booking = booking;

        // Calc miles from coordinates in booking details.
        ctrl.start = _.find(booking.details, { type: 'start' });
        ctrl.end = _.find(booking.details, { type: 'end' });

        // See App: Distance is in a silly 64bit float #532
        // https://github.com/WaiveCar/Waivecar/issues/532
        var distanceInMiles = (ctrl.end.mileage - ctrl.start.mileage) * 0.621371;
        ctrl.distance = distanceInMiles.toFixed(2) + ' miles';
        ctrl.duration = moment(ctrl.start.createdAt).to(ctrl.end.createdAt, true);
        ctrl.booking.total = 0;
        ctrl.booking.failedCharge = false;

        if (ctrl.booking.payments) {
          ctrl.booking.total = ctrl.booking.payments.reduce(function(sum, payment) {
            return sum + (!payment.description.includes('authorization') ? payment.amount : 0);
          }, 0);

          // See https://github.com/WaiveCar/Waivecar/issues/487,
          // App: A declined CC card appears as if the ride was free
          ctrl.booking.failedCharge = ctrl.booking.payments.filter(function(payment) {
            return payment.status === 'failed';
          }).length;
        }

        IntercomService.emitBookingEvent(ctrl.booking, {
          distance: ctrl.distance,
          duration: ctrl.duration
        });

        IntercomService.updateBookingsInfo($auth.me);

      }).catch($message.error);
    };

    ctrl.init();
  }

]);
