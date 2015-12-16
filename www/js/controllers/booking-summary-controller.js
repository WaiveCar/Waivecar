/* global window: false, L: true */
'use strict';
var angular = require('angular');
var moment = require('moment');
var sprintf = require('sprintf-js').sprintf;
var ionic = require('ionic');

require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/ride-service');
require('../services/message-service');
require('../services/modal-service');

module.exports = angular.module('app.controllers').controller('BookingSummaryController', [
  '$rootScope',
  '$scope',
  '$interval',
  '$state',
  '$auth',
  'MockLocationService',
  '$data',
  '$ride',
  '$message',
  '$modal',
  function ($rootScope, $scope, $interval, $state, $auth, LocationService, $data, $ride, $message, $modal) {

    this.init = function () {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }

      $data.resources.Booking.get({ id: $state.params.id }).$promise.then(function(booking) {
        this.booking = booking;
        this.start = booking.details[0];
        this.end = booking.details[0];
        this.distance = this.end.mileage - this.start.mileage + ' miles';
        this.duration = moment(this.start.createdAt).to(this.end.createdAt, true);
      }.bind(this)).catch($message.error);
    };

    this.init();
  }

]);
