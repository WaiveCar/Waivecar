/* global  window: false */
'use strict';
var angular = require('angular');
var ionic = require('ionic');
var moment = require('moment');
var _ = require('lodash');
// var ionic = require('ionic');
var sprintf = require('sprintf-js').sprintf;

// 0.019 essentially maps to "100 imperial feet" - about
// the length of a suburban home + property.
var UNLOCK_RADIUS = 0.019 * 2;

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
      if(ctrl.isExtended) {
        expired = moment($data.active.bookings.createdAt).add(25, 'm');
      }
    }
  });

  function loadExtended() {
    expired = moment($data.active.bookings.createdAt).add(25, 'm');
    ctrl.isExtended = true;
  }

  function showFailure(title, message, opts) {
    opts = opts || {};
    var modal;
    $modal('result', {
      title: title,
      message: message,
      icon: 'x-icon',
      actions: [{
        className: 'button-balanced',
        text: opts.label ? opts.label : 'ok',
        handler: function () {
          modal.remove();
          if(opts.cb) {
            opts.cb();
          }
        }
      }]
    })
    .then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  }

  function loadCar(id) {
    $data.resources.cars.get({ id: id }).$promise.then(function(car) {
      ctrl.car = car;
      ctrl.car.model = ctrl.car.model || "ioniq";
      ctrl.car.image = 'https://waive.car/images/cars/' + ctrl.car.model.toLowerCase().split(' ')[0] + '_384.png';

      if (car.lastBooking) {
        var end = _.find(car.lastBooking.details, { type: 'end' });
        if (end) {
          ctrl.parkingDetails = end.parkingDetails;
        }
      }
    });
  }

  function watchBook() {
    if($data.active.bookings) {
      if(!ctrl.isExtended && $data.active.bookings.flags && $data.active.bookings.flags.search(/exten/) !== -1) {
        // A perhaps bad idea on my part (cjm) ... I swap out 
        // the word 'extension' for 'extended' when the extended
        // time happens ... as a boolean.  That's also the
        // test case to see if it was extended at all.  So
        // we are doing 2 things in one place - bad idea.
        loadExtended();
      }
    } 
  }
  var timer = $interval(function() {
    if (expired) {
      watchBook();
      // if we are in the future then the answer is 0.
      if (moment().diff(expired) > 0) {
        console.log(expired, moment().diff(expired));
        $interval.cancel(timer);
        showExpired();
      } else {
        ctrl.timeLeft = moment(expired).format('h:mm A');
        return ctrl.timeLeft;
      }
    }
    return null;
  }, 1000);

  var stopWatching;
  function watchForWithinRange () {
    watchBook();
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
    watchBook();
    var distance = $distance($data.active.cars, currentLocation);
    if (_.isFinite(distance)) {
      // convert miles to yards
      $scope.distance = distance;
      if ($scope.distance <= UNLOCK_RADIUS) {
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
    return showFailure(
      'Connection Failed', 
      'We couldn\'t connect to the server. If the problem persists call .' + $settings.phone, {
        label: 'retry'
      }
    );
  }

  this.extendBooking = function extendBooking() {
    var modal;
    var extendedExpire = moment(expired).add(10, 'm').format('h:mm A');
    $modal('result', {
      title: 'Extend Reservation?',
      message: 'Extend reservation to <b>' + extendedExpire + '</b> for $1.00?',
      icon: 'waivecar-mark',
      actions: [{
        className: 'button-balanced',
        text: 'I\'ll buy that for a dollar',
        handler: function () {
          modal.remove();
          $data.resources.bookings.extend({id: $ride.state.booking.id}).$promise
            .then(function() {} )
            .catch(function(err) {
              showFailure('Unable to extend', 'There was a problem extending your reservation');
            });
        }
      }, {
        className: 'button-dark',
        text: 'No thanks',
        handler: function () {
          modal.remove();
      }}]
    })
    .then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  };

  function showExpired() {
    return showFailure(
      'Booking is expired', 
      'You booking is expired', { 
        cb: function() {
          $state.go('cars');
        }
      }
    );
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
            $message.success('Your booking has been successfully cancelled');
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
      $data.resources.bookings.ready({ id: id }).$promise
      .then(function() {
        return $data.fetch('bookings');
      })
      .then(function() {
        IntercomService.emitBookingEvent($data.active.bookings);
        $ionicLoading.hide();
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
