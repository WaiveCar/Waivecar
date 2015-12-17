'use strict';
var angular = require('angular');

require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/ride-service');

module.exports = angular.module('app.controllers').controller('EndRideController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$ride',
  function ($rootScope, $scope, $state, $auth, $data, $ride) {

    // Concepts:
    // $scope is used to store ref. to the service and the active models in the data svc.
    // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.

    $scope.service = $ride;
    $scope.data = $data.active;

    $scope.showVideo = false;
    $scope.toggleVideo = function() {
      $scope.showVideo = !$scope.showVideo;
    };

    this.init = function () {
      var rideServiceReady = $scope.$watch('service.isInitialized', function(isInitialized) {
        console.log(isInitialized);
        if (isInitialized === true) {
          rideServiceReady();
          if ($state.current.name === 'end-ride') {
            $scope.service.processEndRide();
          }
        }
      });
    };

    this.init();
  }
]);
