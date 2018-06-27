'use strict';
var angular = require('angular');
var moment = require('moment');

require('angular-ui-router');
require('../services/data-service');

module.exports = angular.module('app.controllers').controller('StartRideController', [
  '$scope',
  '$rootScope',
  '$injector',
  '$stateParams',
  '$ride',
  function ($scope, $rootScope, $injector, $stateParams, $ride) {
    var $data = $injector.get('$data');
    var $state = $injector.get('$state');
    var $ionicLoading = $injector.get('$ionicLoading');
    var $modal = $injector.get('$modal');
    $scope.service = $ride;

    // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
    var ctrl = this;
    ctrl.data = $data.active;
    ctrl.extDamage = true;
    ctrl.intDamage = true;
    ctrl.dirty = true;
    ctrl.pictures = {
      front: null,
      left: null,
      rear: null,
      right: null,
    }

    ctrl.start = start;
    ctrl.toggle = toggle;
    ctrl.addPicture = addPicture;

    var initialized = $scope.$watch('service.isInitialized', function(isInitialized) {
      if (isInitialized !== true) {
        return;
      }
      initialized();

      var booking = $data.active.bookings;
      ctrl.timeLeft = moment(booking.createdAt).add(120, 'm').toNow(true);
    });

    function start () {
      $state.go('dashboard', null, {location: 'replace'});
    }

    function toggle(field) {
      this[field] = !this[field];
    }

    function addPicture() {
      console.log('clicked');
    }
  }

]);
