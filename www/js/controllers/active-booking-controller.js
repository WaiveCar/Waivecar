/* global  window: false */
'use strict';
var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');

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
  var $ionicLoading = $injector.get('$ionicLoading');
  var $auth = $injector.get('$auth');
  var LocationService = $injector.get('LocationService');
  var IntercomService = $injector.get('IntercomService');
  var _locationWatch;
  var ctrl = this;
  var expired;

  if($data.me && $data.me.hasTag) {
    ctrl.hasAutoExtend = $data.me.hasTag('extend') === 1;
  } else {
    ctrl.hasAutoExtend = false;
  }

  // 0.019 essentially maps to "100 imperial feet" - about
  // the length of a suburban home + property.
  // ^^ Actually this is wayyy too far, let's make it 0.013
  var UNLOCK_RADIUS = 0.013 * 2;

  var modalMap = {};

  // $scope is used to store ref. to $ride and the active models in $data.
  $scope.distance = 'Unknown';
  $scope.service = $ride;

  // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
  this.data = $data.active;
  var _unlockModal;

  if($data.active.bookings 
      && $data.active.bookings.flags 
      && $data.active.bookings.flags.includes
      && $data.active.bookings.flags.includes("rush")) {
    $data.fetch('bookings').then(function(bookingList) {
      $state.go('dashboard', { id: $ride.state.booking.id });
    });
  } else {
    var stopServiceWatch = $scope.$watch('service.isInitialized', function(isInitialized) {
      if (!isInitialized) {
        return;
      }

      // ctrl.car = $data.active.cars;
      stopServiceWatch();
      stopServiceWatch = null;
      watchForUnlock();
      if ($data.active.bookings) {
        loadCar($data.active.bookings.carId);
        expired = moment($data.active.bookings.reservationEnd);
      }
    });

    var timer_ix = 0;
    var timer = $interval(function() {
      timer_ix++;
      if (expired) {
        // When the booking is extended, the end time needs to be pulled
        // down from the booking
        expired = moment($data.active.bookings.reservationEnd);
        if($data.active.bookings) {
          if(!ctrl.isExtended && $data.active.bookings.flags && $data.active.bookings.flags.search(/exten/) !== -1) {
            // A perhaps bad idea on my part (cjm) ... I swap out
            // the word 'extension' for 'extended' when the extended
            // time happens ... as a boolean.  That's also the
            // test case to see if it was extended at all.  So
            // we are doing 2 things in one place - bad idea.
            ctrl.isExtended = true;
          }
        }
        // if we are in the future then the answer is 0.
        if (moment().diff(expired) > 0) {
          if(timer_ix % 12 == 0) {
            $data.fetch('bookings').then(function(bookingList) {
              if(bookingList[0].status === 'cancelled') {
                $interval.cancel(timer);
                showExpired();
              }
            });
          }
        } else {
          ctrl.timeLeft = moment(expired).format('h:mm A');
          return ctrl.timeLeft;
        }
      }
      return null;
    }, 1000);
  }

  function showFailure(title, message, opts) {
    opts = opts || {};
    var modal;
    function handler() {
      if(modal) {
        if(opts.cb) {
          opts.cb();
        }
        modal.remove();
        modal = false;
      }
    }

    $modal('result', {
      title: title,
      message: message,
      icon: 'x-icon',
      actions: [{
        className: 'button-balanced',
        text: opts.label ? opts.label : 'ok',
        handler: handler
      }]
    })
    .then(function (_modal) {
      setTimeout(handler, 7 * 1000);
      modal = _modal;
      modal.show();
    });
  }

  function showRetry () {
    return showFailure('Connection Failed',
      'We couldn\'t connect to the server. If the problem persists call ' + $settings.phone, {
        label: 'retry'
      }
    );
  }

  function showExpired() {
    return showFailure('Booking is expired', 'You booking is expired', {
      cb: function() {
        // There's two ways of expiring the booking in the app state. We can
        // either try to pull it down ourselves or we can just dumpt it like so.
        delete $data.active.bookings;
        $state.go('cars');
        Object.values(modalMap).forEach(function(modal) {
          modal.remove();
        });
      }
    });
  }

  function loadCar(id) {
    $data.resources.cars.get({ id: id }).$promise.then(function(car) {
      ctrl.car = car;
      ctrl.car.model = ctrl.car.model || "ioniq";
      ctrl.car.image = 'https://waivecar.com/images/cars/' + ctrl.car.model.toLowerCase().split(' ')[0] + '_384.png';

      if (car.lastBooking) {
        var end = _.find(car.lastBooking.details, { type: 'end' });
        if (end) {
          ctrl.parkingDetails = end.parkingDetails;
        }
      }
    });
  }


  function stopWatchingForUnlock() {
    if (_locationWatch != null) {
      _locationWatch.stop();
      _locationWatch = null;
    }
  }

  function watchForUnlock () {
    if (_locationWatch && _locationWatch.isActive()) {
      return;
    }
    LocationService.getCurrentLocation().then(function(loc) {
      ctrl.route = {
        destiny: $data.active.cars,
        fitBoundsByRoute: true,
        start: loc
      };
    });

    _locationWatch = LocationService.watchLocation(function (currentLocation, callCount) {
      if(!callCount && !ctrl.route) {
        ctrl.route = {
          destiny: $data.active.cars,
        };
      }
      ctrl.route.start = currentLocation;
      ctrl.route.fitBoundsByRoute = (callCount < 3);
      ctrl.currentLocation = currentLocation;

      checkIsInRange(currentLocation);
    });
  }

  function checkIsInRange (currentLocation, ix, iy) {
    var distance = $distance($data.active.cars, currentLocation);
    if (_.isFinite(distance)) {
      $scope.distance = distance;
      if ($scope.distance <= UNLOCK_RADIUS) {
        stopWatchingForUnlock();
        showUnlock();
        return true;
      }
    }
  }

  this.extendAction = function (howmuch, extendAlways) {
    // It takes a few seconds for the extension to go through since it
    // calls stripe and does a charge so we fake it until we make it. 
    ctrl.isExtended = true;
    var body = {
      howmuch: howmuch,
      id: $ride.state.booking.id,
    }
    if (extendAlways) {
      body.addToAutoExtend = true;
      ctrl.hasAutoExtend = true;
    }
    $data.resources.bookings.extend(body).$promise
      .then(function() { 
        $auth.reload();
      })
      .catch(function(err) {
        ctrl.isExtended = false;
        ctrl.hasAutoExtend = false;
        showFailure('Unable to extend', 'There was a problem extending your reservation');
      });
  }

  this.extendBooking = function extendBooking() {
    var modal;

    $modal('result', {
      title: 'Extend Reservation',
      message:  [
        "First 10 extra minutes are $1.00.<br>"+
        "Then each extra minute is $0.30.",
      ].join(' '),
      icon: 'waivecar-mark',
      hasExtend: true,
      extendAlways: false,
      actions: [
      { 
        className: 'button-balanced',
        text: 'Extend my reservation',
        handler: function (extendAlways) {
          modal.remove();
          ctrl.extendAction(-1, extendAlways);
        }
      }, 
      {
        className: 'button-dark',
        text: "No, I'll make it by " + moment(expired).format('h:mm A'),
        handler: function () {
          modal.remove();
      }}]
    })
    .then(function (_modal) {
      modalMap.extend = _modal;
      modal = _modal;
      modal.show();
    });
  };

  this.autoExtendRemove = function() {
    var modal;

    $modal('result', {
      title: 'Remove Auto-extend?',
      message: 'Would you like to disable auto-extend for future bookings?',
      icon: 'x-icon',
      actions: [{
        className: 'button-assertive',
        text: "Yes, I'll manually extend",
        handler: function () {
          modal.remove();
          $ionicLoading.show({
            template: '<div class="circle-loader"><span>Loading</span></div>'
          });
          $data.resources.users.tags({verb: 'del', tag: 'extend'}).$promise
          .then(function(){
            $ionicLoading.hide();
            ctrl.hasAutoExtend = false;
            ctrl.isExtended = true;
            $auth.reload();
            $message.success('Auto-extension on future bookings has been turned off');
          })
          .catch(function(err) {
            $ionicLoading.hide();
            $message.error('An error happened. Please try again or contact us for help');
          });
        }
      }, {
        className: 'button-dark',
        text: 'Keep it on',
        handler: function () {
          $message.success('Auto-extension will continue.');
          modal.remove();
        }
      }]
    }).then(function (_modal) {
      modalMap.autoextendRemove = _modal;
      modal = _modal;
      modal.show();
    });
  }

  this.showCancel = function() {
    var modal;
    var cancelling = false;
    var booking = $data.active.bookings;
    if (booking == null || booking.status !== 'reserved') {
      if(!booking || booking.status === 'cancelled') {
        return $state.go('cars');
      }
      return;
    }

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
          watchForUnlock();
        }
      }]
    }).then(function (_modal) {
      modalMap.cancel = _modal;
      modal = _modal;
      modal.show();
    });
  };

  // This is for when a user gets to the waivecar but the unlock screen comes up
  // before they can actually find the car. They will want to return to the map
  // to see where the car is.
  function showMap () {
    if(modalMap.unlock) {
      modalMap.unlock.hide();
    }
  }

  function showUnlock () {
    var unlocking;
    var booking = $data.active.bookings;
    if (booking == null || booking.status !== 'reserved' || _unlockModal) {
      return;
    }
    function show() {
      _unlockModal = true;
      modalMap.unlock.show();
    }

    if(modalMap.unlock) {
      return show();
    }
    // we try to buy a few seconds to connect to the car's ble by starting the
    // process right before flaunting the unlock screen
    $data.resources.cars.connect({id: $data.active.cars.id});

    var plateNumber = $data.active.cars.license;
    if($data.active.cars.plateNumber) {
      plateNumber += ' (' + $data.active.cars.plateNumber + ')';
    }

    var survey = '';
    if($data.active.cars.model !== 'Spark EV') {
      survey = "\nPlease note that there's a brief survey with the Ioniqs after the first three rides.";
    }
    $modal('result', {
      title: 'You\'re In Reach',
      message: 'Welcome to ' + plateNumber + ". It's time to start your ride!" + survey,
      icon: 'check-icon',
      actions: [{
        className: 'button-balanced',
        text: 'Unlock ' + $data.active.cars.license,
        handler: onUnlock
      }, 
      {
        className: 'button-dark',
        text: 'Return to the Map',
        handler: showMap
      },
      {
        className: 'button-small button-link',
        text: 'Cancel My Booking',
        handler: function () {
          modalMap.unlock.hide();
          _unlockModal = false;
          ctrl.showCancel();
        }
      }]
    })
    .then(function (_modal) {
      modalMap.unlock = _modal;
      show();
    });

    function onUnlock () {
      if (unlocking) {
        return;
      }
      unlocking = true;

      $ionicLoading.show({
        template: '<div class="circle-loader"><span>Loading</span></div>'
      });

      var id = $ride.state.booking.id;

      $data.resources.cars.unlock({ id: $data.active.cars.id });
      $data.resources.bookings.ready({ id: id }).$promise
      .then(function() {
        _unlockModal = false;
        $ionicLoading.hide();
        modalMap.unlock.hide();
        $interval.cancel(timer);
        unlocking = false;

        if ($data.me.hasTag('level')) {
          $state.go('dashboard', { id: id });
        } else {
          $state.go('start-ride', { id: id });
        }
      })
      .then(function(data) {
        return $data.fetch('bookings');
      })
      .catch(function(err) {
        $ionicLoading.hide();
        unlocking = false;
        $message.error(err);
        modalMap.unlock.hide();
        showRetry();
      });
    }
  }

  this.getDirections = function getDirections () {
    $ride.openDirections(this.car, this.car.license);
  };

  ctrl.startIfBleFound = function() {
    _unlockModal = false;
    if(checkIsInRange( ctrl.currentLocation )) {
      //$ionicLoading.show();
    
      $data.resources.cars.connect({id: this.car.id})
        .then(function() {
          //$ionicLoading.hide();
          showUnlock();
        }).catch(function(reason){
          //$ionicLoading.hide();
          console.log("Unable to connect", reason);
          showFailure("Can't find car", "Please make sure you are next to the WaiveCar");
        });
    } else {
      showUnlock();
    }
  }

  $scope.$on('$destroy', function () {
    stopWatchingForUnlock();
    if (stopServiceWatch != null) {
      stopServiceWatch();
    }
  });
}

module.exports = angular.module('app.controllers').controller('ActiveBookingController', [
  '$scope',
  '$rootScope',
  '$injector',
  ActiveBookingController
]);
