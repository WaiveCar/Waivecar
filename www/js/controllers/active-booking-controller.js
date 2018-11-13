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
  var LocationService = $injector.get('LocationService');
  var IntercomService = $injector.get('IntercomService');
  var _locationWatch;
  var ctrl = this;
  var expired;
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
  var unlockModal;

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
      ctrl.car.image = 'https://lb.waivecar.com/images/cars/' + ctrl.car.model.toLowerCase().split(' ')[0] + '_384.png';

      if (car.lastBooking) {
        var end = _.find(car.lastBooking.details, { type: 'end' });
        if (end) {
          ctrl.parkingDetails = end.parkingDetails;
        }
      }
    });
  }

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

    _locationWatch = LocationService.watchLocation(function (currentLocation, callCount) {
      if (!callCount) {
        ctrl.route = {
          destiny: $data.active.cars
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

  this.extendAction = function (howmuch) {
    // It takes a few seconds for the extension to go through since it
    // calls stripe and does a charge so we fake it until we make it. 
    ctrl.isExtended = true;
    var oldEnd = $data.active.bookings.reservationEnd;
    $data.active.bookings.reservationEnd = moment($data.active.bookings.reservationEnd).add(howmuch, 'm');

    $data.resources.bookings.extend({
      howmuch: howmuch,
      id: $ride.state.booking.id
    }).$promise
      .then(function() { })
      .catch(function(err) {
        $data.active.bookings.reservationEnd = oldEnd;
        ctrl.isExtended = false;
        showFailure('Unable to extend', 'There was a problem extending your reservation');
      });
  }

  this.extendBooking = function extendBooking() {
    var modal;

    var extendedExpire = {
      0: 'by ' + moment(expired).format('h:mm A'),
      10: 'to ' + moment(expired).add(10, 'm').format('h:mm A'),
      20: 'to ' + moment(expired).add(20, 'm').format('h:mm A')
    };

    if(extendedExpire['10'].search(/Invalid/i) !== -1) {
      extendedExpire = {
        0: 'on time',
        10: '10 minutes',
        20: '20 minutes'
      };
    }

    $modal('result', {
      title: 'Extend Reservation',
      message: 'Extend your reservation for more time to get to your WaiveCar.' + [
        "<br/><p><b>Reminder:</b> You'll have to wait 30 minutes to rebook the same WaiveCar if you don't make it in time!</p>"
      ].join(' '),
      icon: 'waivecar-mark',
      actions: [
      { 
        className: 'button-balanced',
        text: 'Extend ' +  extendedExpire['20'] + ' for $4.20',
        handler: function () {
          modal.remove();
          ctrl.extendAction(20);
        }
      }, 
      {
        className: 'button-dark',
        text: 'Extend ' +  extendedExpire['10'] + ' for $1.00',
        handler: function () {
          modal.remove();
          ctrl.extendAction(10);
        }
      }, 
      {
        className: 'button-link button-small',
        text: "I'll make it " + extendedExpire['0'] + ". No thanks!",
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
      modalMap.unlock.remove();
    }
  }

  function showUnlock () {
    var modal;
    var unlocking;
    var booking = $data.active.bookings;
    if (booking == null || booking.status !== 'reserved' || unlockModal) {
      return;
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
      message: 'Welcome to ' + plateNumber + '. Now you can unlock your WaiveCar!' + survey,
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
        text: 'Cancel Your Booking',
        handler: function () {
          unlockModal = false;
          modal.remove();
          ctrl.showCancel();
        }
      }]
    })
    .then(function (_modal) {
      modal = _modal;
      modal.show();
      modalMap.unlock = modal;
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

      $data.resources.cars.unlock({ id: $data.active.cars.id });
      $data.resources.bookings.ready({ id: id }).$promise
      .then(function() {
        $ionicLoading.hide();
        modal.remove();
        unlocking = false;
        if ($data.me.hasTag('level')) {
          console.log('car is level');
          $state.go('dashboard', { id: id });
        } else {
          $state.go('start-ride', { id: id });
        }
      })
      .then(function(data) {
        return $data.fetch('bookings');
      })
      .then(function() {
        IntercomService.emitBookingEvent($data.active.bookings);
      })
      .catch(function(err) {
        $ionicLoading.hide();
        unlocking = false;
        $message.error(err);
        modal.remove();
        showRetry();
      });
    }
  }

  this.getDirections = function getDirections () {
    $ride.openDirections(this.car, this.car.license);
  };

  ctrl.startIfBleFound = function() {
    unlockModal = false;
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
