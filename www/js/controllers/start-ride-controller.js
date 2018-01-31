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

    ctrl.start = start;
    ctrl.toggle = toggle;

    var initialized = $scope.$watch('service.isInitialized', function(isInitialized) {
      if (isInitialized !== true) {
        return;
      }
      initialized();

      var booking = $data.active.bookings;
      ctrl.timeLeft = moment(booking.createdAt).add(120, 'm').toNow(true);
    });

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
            $state.go('dashboard', null, {location: 'replace'});
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

    function start () {
      if (ctrl.dirty || ctrl.intDamage || ctrl.extDamage) {
        $state.go('damage-gallery', { id: $stateParams.id, return: 'dashboard' });
      } else {
        showNote();
      }
    }

    function toggle(field) {
      this[field] = !this[field];
    }
  }

]);
