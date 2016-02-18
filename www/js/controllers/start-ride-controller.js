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
    var $ionicLoading = $injector.get('$ionicLoading');

    this.showVideo = false;
    this.toggleVideo = function() {
      this.showVideo = !this.showVideo;
    };

    // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
    $scope.data = $data.active;

    this.start = function () {

      $ionicLoading.show({
        template: '<div class="circle-loader"><span>Loading</span></div>'
      });

      $data.fetch('bookings')
        .then(function () {
          $ionicLoading.hide();
          $state.go('dashboard', null, {location: 'replace'});
        });
    };
  }

]);
