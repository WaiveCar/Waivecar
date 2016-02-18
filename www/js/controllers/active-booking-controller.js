'use strict';
var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');
var ionic = require('ionic');
var sprintf = require('sprintf-js').sprintf;

require('../services/ride-service');
require('../services/data-service');
require('../services/distance-service');
require('../services/modal-service');
require('../services/message-service');
require('../services/progress-service');

function ActiveBookingController ($scope, $rootScope, $injector) {
  var $ride = $injector.get('$ride');
  var $data = $injector.get('$data');
  var $distance = $injector.get('$distance');
  var $interval = $injector.get('$interval');
  var $modal = $injector.get('$modal');
  var $state = $injector.get('$state');
  var $message = $injector.get('$message');
  var $settings = $injector.get('$settings');
  var $cordovaInAppBrowser = $injector.get('$cordovaInAppBrowser');
  var $progress = $injector.get('$progress');
  var $ionicLoading = $injector.get('$ionicLoading');

  $scope.distance = 'Unknown';
  // $scope is used to store ref. to $ride and the active models in $data.
  $scope.service = $ride;

  // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
  this.data = $data.active;

  var expired;
  var stopServiceWatch = $scope.$watch('service.isInitialized', function(isInitialized) {
    if (!isInitialized) {
      return;
    }
    stopServiceWatch();
    stopServiceWatch = null;
    watchForWithinRange();
    if ($data.active.bookings) {
      expired = moment($data.active.bookings.createdAt).add(15, 'm');
    }
  });

  var timer = $interval(function() {
    if (expired) {
      var time = moment(expired).toNow(true);
      this.timeLeft = time;
    }
  }.bind(this), 1000);

  var stopWatching;
  function watchForWithinRange () {
    if (stopWatching != null) {
      return;
    }
    stopWatching = $rootScope.$watch('currentLocation', function (value) {
      if (value == null) {
        return;
      }
      var distance = $distance($data.active.cars);
      if (_.isFinite(distance)) {
        // convert miles to yards
        $scope.distance = distance * 1760;
        if ($scope.distance <= 35) {
          console.log('Showing unlock');
          stopWatching();
          stopWatching = null;
          showUnlock();
        }
      }
    });
  }

  $scope.$on('$destroy', function () {
    if (stopWatching != null) {
      stopWatching();
      stopWatching = null;
    }
    if (stopServiceWatch != null) {
      stopServiceWatch();
    }
  });

  function showRetry () {
    var modal;
    $modal('result', {
      title: 'Connection Failed',
      message: 'We couldn\'t connect to the server. If the problem persists call .' + $settings.phone,
      icon: 'x-icon',
      actions: [{
        className: 'button-balanced',
        text: 'Retry',
        handler: function () {
          modal.remove();
        }
      }]
    }).$promise
    .then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  };

  var showCancel = this.showCancel = function showCancel () {
    var modal;
    var booking = $data.active.bookings;
    if (booking == null) {
      return;
    }
    if (booking.status !== 'reserved') {
      return;
    }
    var cancelling = false;
    $modal('result', {
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel your booking?',
      icon: 'x-icon',
      actions: [{
        className: 'button-assertive',
        text: 'Yes',
        handler: function () {
          if (cancelling) {
            return;
          }
          cancelling = true;
          $interval.cancel(timer);
          var id = $ride.state.booking.id;
          $data.remove('bookings', id).then(function() {
            cancelling = false;
            $message.success('Your Booking has been successfully cancelled');
            $data.deactivate('cars');
            $data.deactivate('bookings');
            $ride.setState();
            modal.remove();
            $state.go('cars');
          })
          .catch(function(err) {
            cancelling = false;
            $message.error(err);
            modal.remove();
            showRetry();
          });
        }
      }, {
        className: 'button-dark',
        text: 'No',
        handler: function () {
          modal.remove();
        }
      }]
    }).then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  };

  function showUnlock () {
    var modal;
    var unlocking;
    var booking = $data.active.bookings;
    if (booking == null) {
      return;
    }
    if (booking.status !== 'reserved') {
      return;
    }
    $modal('result', {
      title: 'You\'re In Reach',
      message: 'Now you can unlock your WaiveCar!',
      icon: 'check-icon',
      actions: [{
        className: 'button-balanced',
        text: 'Unlock',
        handler: onUnlock
      }, {
        className: 'button-dark',
        text: 'Cancel Booking',
        handler: function () {
          modal.remove();
          showCancel();
        }
      }]
    })
    .then(function (_modal) {
      modal = _modal;
      modal.show();
    });

    function onUnlock () {

      if (unlocking) {
        return;
      }
      unlocking = true;

      $ionicLoading.show({
        template: '<div class="circle-loader"><span>Loading</span></div>'
      });
      
      $interval.cancel(timer);
      var id = $ride.state.booking.id;
      console.log('unlocking');
      $data.resources.bookings.ready({ id: id }).$promise
      .then(function() {
        console.log('fetching');
        return $data.fetch('bookings');
      })
      .then(function() {
        $ionicLoading.hide();
        console.log('removing modal');
        modal.remove();
        unlocking = false;
        $state.go('start-ride', { id: id });
      })
      .catch(function(err) {
        $ionicLoading.hide();
        unlocking = false;
        $message.error(err);
        modal.remove();
        $progress.hide();
        showRetry();
      });
    }
  }

  this.getDirections = function getDirections () {
    var booking = $data.active.bookings;
    if (booking == null) {
      return;
    }
    if (booking.status !== 'reserved') {
      return;
    }
    var url;
    var sprintfOptions = {
      startingLat: $rootScope.currentLocation.latitude,
      startingLon: $rootScope.currentLocation.longitude,
      targetLat: $data.active.cars.latitude,
      targetLon: $data.active.cars.longitude
    };

    if (ionic.Platform.isWebView()) {
      url = [
        'comgooglemaps-x-callback://?',
        '&saddr=%(startingLat)s,%(startingLon)s',
        '&daddr=%(targetLat)s,%(targetLon)s',
        '&directionsmode=walking',
        '&x-success=WaiveCar://?resume=true',
        '&x-source=WaiveCar'
      ].join('');
      url = sprintf(url, sprintfOptions);
      $cordovaInAppBrowser.open(encodeURI(url), '_system');
      return;
    }

    url = 'http://maps.google.com/maps?saddr=%(startingLat)s,%(startingLon)s&daddr=%(targetLat)s,%(targetLon)s&mode=walking';
    url = sprintf(url, sprintfOptions);
    $cordovaInAppBrowser.open(url);
  };
}

module.exports = angular.module('app.controllers').controller('ActiveBookingController', [
  '$scope',
  '$rootScope',
  '$injector',
  ActiveBookingController
]);
