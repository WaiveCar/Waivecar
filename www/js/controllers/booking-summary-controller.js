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
  function ($state, $auth, $data, $message) {

    var ctrl = this;

    ctrl.init = function () {
      $data.resources.bookings.get({ id: $state.params.id }).$promise.then(function(booking) {
        ctrl.booking = booking;

        // Calc miles from coordinates in booking details.
        ctrl.start = _.find(booking.details, { type: 'start' });
        ctrl.end = _.find(booking.details, { type: 'end' });

        // See App: Distance is in a silly 64bit float #532
        // https://github.com/clevertech/Waivecar/issues/532
        var distance_in_miles = (ctrl.end.mileage - ctrl.start.mileage) * 0.621371;
        ctrl.distance = distance_in_miles.toFixed(2) + ' miles';
        ctrl.duration = moment(ctrl.start.createdAt).to(ctrl.end.createdAt, true);

        ctrl.booking.total = ctrl.booking.payments ? ctrl.booking.payments.reduce(function(sum, payment) {
          return sum + payment.amount;
        }, 0) : 0;
      }).catch($message.error);
    };

    ctrl.init();
  }

]);
