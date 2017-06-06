/* global  window: false */
'use strict';
var angular = require('angular');
var ionic = require('ionic');
var moment = require('moment');
var _ = require('lodash');
// var ionic = require('ionic');
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
  var LocationService = $injector.get('LocationService');
  var IntercomService = $injector.get('IntercomService');

  $scope.distance = 'Unknown';
  // $scope is used to store ref. to $ride and the active models in $data.
  $scope.service = $ride;

  // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
  var ctrl = this;
  this.data = $data.active;

  var expired;
  var stopServiceWatch = $scope.$watch('service.isInitialized', function(isInitialized) {
    if (!isInitialized) {
      return;
    }

    // ctrl.car = $data.active.cars;
    stopServiceWatch();
    stopServiceWatch = null;
    watchForWithinRange();
    if ($data.active.bookings) {
      loadCar($data.active.bookings.carId);
      expired = moment($data.active.bookings.createdAt).add(15, 'm');
    }
  });

  function loadCar(id) {
    $data.resources.cars.get({ id: id }).$promise.then(function(car) {
      ctrl.car = car;

      if (car.lastBooking) {
        var end = _.find(car.lastBooking.details, { type: 'end' });
        if (end) {
          ctrl.parkingDetails = end.parkingDetails;
        }
      }
    });
  }

  var timer = $interval(function() {
    if (expired) {
      // if we are in the future then the answer is 0.
      if (moment().diff(expired) > 0) {
        $interval.cancel(timer);
        showExpired();
      } else {
        this.timeLeft = moment(expired).toNow(true);
        return this.timeLeft;
      }
    }
    return null;
  }.bind(this), 1000);

  var stopWatching;
  function watchForWithinRange () {
    if (stopWatching != null) {
      return;
    }

    stopWatching = LocationService.watchLocation(function (currentLocation, isInitialCall) {

      if (isInitialCall) {
        ctrl.route = {
          destiny: $data.active.cars
        };
      }
      ctrl.route.start = currentLocation;
      ctrl.route.fitBoundsByRoute = isInitialCall;
      ctrl.currentLocation = currentLocation;

      checkIsInRange(currentLocation);

    });
  }

  function checkIsInRange (currentLocation) {
    var distance = $distance($data.active.cars, currentLocation);
    if (_.isFinite(distance)) {
      // convert miles to yards
      $scope.distance = distance;
      if ($scope.distance <= 0.019) {
        console.log('Showing unlock');
        if (stopWatching) {
          stopWatching();
          stopWatching = null;
        }
        showUnlock();
      }
    }
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

  function showExpired() {
    var modal;
    $modal('result', {
      title: 'Booking is expired',
      message: 'You booking is expired',
      icon: 'x-icon',
      actions: [{
        className: 'button-assertive',
        text: 'OK',
        handler: function () {
          modal.remove();
          $state.go('cars');
        }
      }]
    }).then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  }

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
          $ionicLoading.show({
            template: '<div class="circle-loader"><span>Loading</span></div>'
          });
          if (cancelling) {
            $ionicLoading.hide();
            return;
          }
          cancelling = true;
          $interval.cancel(timer);
          var id = $ride.state.booking.id;
          $data.remove('bookings', id).then(function() {
            $ionicLoading.hide();
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
            $ionicLoading.hide();
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

  var unlockModal;

  function showUnlock () {
    var modal;
    var unlocking;
    var booking = $data.active.bookings;
    if (booking == null || booking.status !== 'reserved' || unlockModal) {
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
          unlockModal = false;
          modal.remove();
          showCancel();
        }
      }]
    })
    .then(function (_modal) {
      modal = _modal;
      modal.show();
      unlockModal = true;
    });

    function onUnlock () {
      unlockModal = false;
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
        IntercomService.emitBookingEvent($data.active.bookings);


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


    var isIOS = ionic.Platform.isIOS();
    var geocoords = this.car.latitude + ',' + this.car.longitude;

    if (isIOS) {
      window.open('maps://?q=' + geocoords, '_system');
    } else {
      var label = encodeURI(this.car.license);
      window.open('geo:0,0?q=' + geocoords + '(' + label + ')', '_system');
    }

  };
}

module.exports = angular.module('app.controllers').controller('ActiveBookingController', [
  '$scope',
  '$rootScope',
  '$injector',
  ActiveBookingController
]);
