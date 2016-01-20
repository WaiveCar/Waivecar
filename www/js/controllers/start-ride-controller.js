'use strict';
var angular = require('angular');

require('angular-ui-router');
require('../services/data-service');

module.exports = angular.module('app.controllers').controller('StartRideController', [
  '$scope',
  '$rootScope',
  '$injector',
  function ($scope, $rootScope, $injector) {
    var $data = $injector.get('$data');
    var $state = $injector.get('$state');

    this.showVideo = false;
    this.toggleVideo = function() {
      this.showVideo = !this.showVideo;
    };

    // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
    $scope.data = $data.active;

    this.start = function () {
      $data.fetch('bookings')
        .then(function () {
          $state.go('dashboard', null, {location: 'replace'});
        });
    };
  }

]);
