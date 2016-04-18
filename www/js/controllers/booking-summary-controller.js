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
        console.log(booking.details);
        // Calc miles from coordinates in booking details.
        ctrl.start = _.find(booking.details, { type: 'start' });
        ctrl.end = _.find(booking.details, { type: 'end' });

        console.log('start: ', ctrl.start);
        console.log('end: ', ctrl.end);
        ctrl.distance = ctrl.end.mileage - ctrl.start.mileage + ' miles';
        ctrl.duration = moment(ctrl.start.createdAt).to(ctrl.end.createdAt, true);

        ctrl.booking.total = ctrl.booking.payments ? ctrl.booking.payments.reduce(function(sum, payment) {
          return sum + payment.amount;
        }, 0) : 0;
      }).catch($message.error);
    };

    ctrl.init();
  }

]);
