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
    var Reports = $injector.get('Reports');
    $scope.service = $ride;

    // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
    var ctrl = this;
    ctrl.data = $data.active;
    ctrl.pictures = {
      front: null,
      left: null,
      rear: null,
      right: null,
      other: null,
    }
    ctrl.model = ctrl.data.cars.model.split(' ')[0].toLowerCase(); 
    ctrl.range = Math.floor(0.01 * ctrl.data.cars.charge * [132,65][+(ctrl.data.cars.model === "Spark EV")]);
    ctrl.allPics = false;
    ctrl.buttonClass = 'button button-dark add-image'; 
    ctrl.start = start;
    ctrl.toggle = toggle;
    ctrl.addPicture = addPicture;
    ctrl.continueToRide = continueToRide;

    ctrl.skip = function() {
      ctrl.allPics = true;
    }

    var initialized = $scope.$watch('service.isInitialized', function(isInitialized) {
      if (isInitialized !== true) {
        return;
      }
      initialized();

      var booking = $data.active.bookings;
      ctrl.timeLeft = moment(booking.createdAt).add(120, 'm').toNow(true);
    });

    function start () {
      var picsToSend = [];
      for (var picture in ctrl.pictures) {
        picsToSend.push(ctrl.pictures[picture]);
      }
      Reports.create({
        bookingId: $stateParams.id,
        description: null,
        files: picsToSend
      });
      $state.go('dashboard', null, {location: 'replace'});
    }

    function toggle(field) {
      this[field] = !this[field];
    }

    function addPicture(type) {
      $uploadImage({
        endpoint: '/files?bookingId=' + ctrl.data.bookings.id,
        type: type,
        filename: type + $stateParams.id + '_' + Date.now() + '.jpg',
        sourceList: ['camera']
      })
      .then(function (result) {
        if (result && Array.isArray(result)) result = result[0];
        if (result) {
          result.style = {
            'background-image': 'url(' + $settings.uri.api + '/file/' + result.id + ')'
          };
          ctrl.pictures[type] = result;
          ctrl.pictures[type].type = type;
          if (ctrl.pictures['front'] && ctrl.pictures['left'] && ctrl.pictures['rear'] && ctrl.pictures['right']) {
            ctrl.allPics = true;
          }
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
    function continueToRide() {
      console.log('continuing');
      $state.go('dashboard', null, {location: 'replace'});
    }
  }
]);
