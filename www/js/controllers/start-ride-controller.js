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
  '$uploadImage',
  '$settings',
  function ($scope, $rootScope, $injector, $stateParams, $ride, $uploadImage, $settings) {
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
      beginFront: null,
      beginLeft: null,
      beginRear: null,
      beginRight: null,
      beginOther: null,
      beginDirty: null,
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

    function addPicture(type) {
      $uploadImage({
        endpoint: '/files?bookingId=' + ctrl.data.bookings.id,
        filename: type + ctrl.data.bookings.id.id + '_' + Date.now() + '.jpg',
      })
      .then(function (result) {
        if (result && Array.isArray(result)) result = result[0];
        if (result) {
          result.style = {
            'background-image': 'url(' + $settings.uri.api + '/file/' + result.id + ')'
          };
          ctrl.pictures[type] = result;
        }
      })
      .catch(function (err) {
        var message = err.message;
        if (err instanceof $window.FileTransferError) {
          if (err.body) {
            var error = angular.fromJson(err.body);
            if (error.message) {
              message = error.message;
            }
          }
        }
        submitFailure(message);
      });
    }
  }

]);
