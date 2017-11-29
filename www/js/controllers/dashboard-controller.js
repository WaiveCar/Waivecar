'use strict';
var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');

require('../services/progress-service');
require('../services/geofencing-service');
require('../services/notification-service');
require('../services/zendrive-service');

function DashboardController ($scope, $rootScope, $injector) {
  var $q = $injector.get('$q');
  var $ride = $injector.get('$ride');
  var $data = $injector.get('$data');
  var $distance = $injector.get('$distance');
  var $modal = $injector.get('$modal');
  var $message = $injector.get('$message');
  var $state = $injector.get('$state');
  var $timeout = $injector.get('$timeout');
  var $window = $injector.get('$window');
  var $ionicLoading = $injector.get('$ionicLoading');
  var GeofencingService = $injector.get('GeofencingService');
  var ZendriveService = $injector.get('ZendriveService');
  var LocationService = $injector.get('LocationService');
  var homebase = $injector.get('homebase');

  // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
  $scope.data = $data.active;
  $scope.service = $ride;
  var ctrl = this;
  this.locations = $data.instances.locations;
  this.fitMapBoundsByMarkers = featured(this.locations);

  this.openPopover = openPopover;
  this.closePopover = closePopover;
  this.lockCar = lockCar;
  this.unlockCar = unlockCar;
  this.endRide = endRide;
  this.endRidePrompt = endRidePrompt;

  // State
  this.ending = false;
  this.locking = false;
  this.unlocking = false;
  this.locked = false;

  this.lastTimeOfParityCheck = null;
  this.lastUserLocations = [];
  this.parityCheckTimeout = null;

  // So there was a bug when this thing wasn't running right ... so 
  // we need to put it in an interval BUUT sometimes it was so we 
  // need to avoid getting this thing to run multiple times because
  // fuck frameworks, that's why ...
  var rideServiceReady = $scope.$watch('service.isInitialized', function(isInitialized) {
    if (isInitialized !== true) {
      return;
    }
    rideServiceReady();

    var stopLocationWatch = LocationService.watchLocation(function (currentLocation, isInitialCall) {
      if (isInitialCall) {
        ctrl.fitMapBoundsByMarkers = featured(ctrl.locations).concat([currentLocation]);
      }
      ctrl.currentLocation = currentLocation;

      checkParityWithUser(currentLocation);
    });

    $scope.$on('$destroy', function () {
      if (stopLocationWatch != null) {
        stopLocationWatch();
        stopLocationWatch = null;
      }
    });

    var booking = $data.active.bookings;

    if (!(booking && booking.status === 'started')) {
      $state.go('cars');
      return;
    }

    if($window.timeOutForRide) {
      clearInterval($window.timeOutForRide);
    }

    // See #605. Since we are going to run the user-facing timer slightly faster than 2 hours 
    // We need to take our ratio and add it to the base, otherwise we start at 1:58:45. 
    // This math will be accounted for in the first calculation.
    var rideStart;
    if(booking.details) {
      rideStart = booking.details[0].createdAt;
    } else {
      rideStart = booking.updatedAt;
    }
    
    var endTime = moment(rideStart).add(120 * (119.25 / 120), 'm');
    var timeLeft = function () {
      // thanks to stupid moment for being stupid...
      var left = -moment().diff(endTime);
      var isFreeTime = (Math.abs(left) === left);
      //
      // See https://github.com/clevertech/Waivecar/issues/605 ... we intentionally drift the time
      // in the users' favor so they don't bicker over a few seconds or if their phone has clock drift
      // they don't say "well my app said so and so!".  As their time expires, the number 'left' decreases.  
      // So we make this decrease a small amount faster so that 2 hours will elapse in 1hr 58:45 ... 
      // This means that a minute is actually 59.375 seconds
      //
      if (!isFreeTime) {
        //
        // If it's pay-time, then we go the other way, slightly speeding things up. This favors the
        // user again because the app will report that they've driven for say, 20 minutes, when the
        // server and actual clock time will be 13 seconds less - so this again helps prevent them
        // from contesting a claim that the app said one thing and we charged them more.  Hopefully,
        // in these edge cases we will always "err" in the users' favor.
        //
        left *= 120 / 119.25;
      }

      if(isFreeTime) {
        this.timeLeft = 'Free until ' + endTime.format('h:mm A');
      } else {
        left = Math.abs(left);
        this.timeLeft = 'Extra: ' + moment.utc(left).format('H:mm:ss');
      }
     
      // This is because frameworks are buggy in interesting ways.
      if(!$scope.$$phase) {
        $scope.$apply();
      } 
    }.bind(this);
    timeLeft();
    // sub 1 second because this is how these things work.
    $window.timeOutForRide = setInterval(timeLeft, 500);
  
    // connect to the ble
    $data.resources.cars.connect({id: $data.active.cars.id}, ctrl);
    startZendrive();
  }.bind(this));

  function startZendrive() {
    return $data.resources.users.me().$promise
      .then(function(me) {
        ZendriveService.start(me, $data.active.bookings.id, $data.active.cars.id);
      })
      .catch(function() {
        console.log('failed to load zendrive');
      });
  }

  function openPopover(item) {
    $timeout(function () {
      ctrl.selectedItem = item;
    });
    return true;
  }

  function closePopover() {
    $timeout(function () {
      ctrl.selectedItem = null;
    });
    return true;
  }

  function lockCar(id) {
    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    if (ctrl.locking === true) {
      return;
    }

    ctrl.locking = true;
    $ride.lockCar(id)
      .then(function () {
        ctrl.locking = false;
        ctrl.locked = true;
        $ionicLoading.hide();
      })
      .catch(function (reason) {
        $ionicLoading.hide();
        ctrl.locking = false;
        if (reason && reason.code === 'IGNITION_ON') {
          showIgnitionOnModal();
          return;
        }
        $message.error(reason);
      });
  }

  function unlockCar(id) {
    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    if (ctrl.unlocking === true) {
      return;
    }

    ctrl.unlocking = true;
    $ride.unlockCar(id)
      .then(function () {
        $ionicLoading.hide();
        ctrl.unlocking = false;
        ctrl.locked = false;
      })
      .catch(function (reason) {
        $ionicLoading.hide();
        ctrl.unlocking = false;
        if (reason && reason.code === 'IGNITION_ON') {
          showIgnitionOnModal();
          return;
        }
        $message.error(reason);
      });
  }

  function sendUserLocationsToServer() {
    if (ctrl.lastUserLocations.length === 0) {
      return;
    }

    var now = new Date();

    if($data.active.bookings) {
      var id = $data.active.bookings.id;
      $data.resources.bookings.checkParity({ id: id, userLocations: ctrl.lastUserLocations, appNowTime: now.getTime() })
        .$promise.then(function() {});

      ctrl.lastTimeOfParityCheck = now;
      ctrl.lastUserLocations = [];
    }
  }

  function checkParityWithUser(location) {
    var now = new Date();

    ctrl.lastUserLocations.push({
      timestamp: now.getTime(),
      latitude: location.latitude,
      longitude: location.longitude
    });

    if (ctrl.parityCheckTimeout) {
      $timeout.cancel(ctrl.parityCheckTimeout);
    }

    if (!ctrl.lastTimeOfParityCheck) {
      ctrl.lastTimeOfParityCheck = now;
    }

    if ( (now - ctrl.lastTimeOfParityCheck) > 60 * 1000) {
      sendUserLocationsToServer();
    } else {
      ctrl.parityCheckTimeout = $timeout(sendUserLocationsToServer, 60 * 1000);
    }

  }

  function endRidePrompt(carId, bookingId) {
    var modal;
    $modal('result', {
      icon: 'x-icon',
      title: 'End Ride',
      message: 'Are you sure you want to end your ride?',
      actions: [{
        text: 'yes',
        className: 'button-dark',
        handler: function () {
          modal.remove();
          ctrl.endRide(carId, bookingId);
        }
      }, {
        text: 'no',
        className: 'button-balanced',
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

  function endRide(carId, bookingId) {
    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    // This feigned attempt at a mutex tries to prevent multiple
    // ends from coming through. It's probably a raindance
    if (ctrl.ending === true) {
      return null;
    }

    ctrl.ending = true;
    return $ride.getStatus(carId).then(function(obj) {
      // This silly hack is so our second closure doesn't
      // shadow our car status.
      ctrl.ending = false;

      if($ride.isCarOn(carId, obj)) {
        return showIgnitionOnModal();
      }

      return $ride.canEndHereCheck(obj).then(function(type) {
        if (type === 'hub') {
          return $ride.processEndRide().then(function() {
            return $state.go('end-ride', { id: bookingId });
          });
        } else if(type === 'zone') {
          return $state.go('end-ride-location', { id: bookingId });
        } else {
          // Not inside geofence -> show error
          if ($ride.isChargeOkay(carId, obj)) {
            return $q.reject('Looks like you\'re outside of the rental zone. Please head back to end your rental.');
          } 
          return $q.reject('Looks like the charge is pretty low. Please head to the nearest hub or charger!');
        }
      }).then($ionicLoading.hide)
        .catch(endRideFailure);
    });
  }

  function featured (items) {
    return _(items)
      .sortBy(function (item) {
        if ($rootScope.currentLocation) {
          return $distance(item);
        }
        return item.id;
      })
      .take(2)
      .value();
  }

  function showIgnitionOnModal () {
    $ionicLoading.hide();
    var ignitionOnModal;
    $modal('result', {
      icon: 'x-icon',
      title: 'Please turn the car off',
      actions: [{
        text: 'Ok',
        className: 'button-balanced',
        handler: function () {
          ignitionOnModal.remove();
        }
      }]
    })
    .then(function (_modal) {
      ignitionOnModal = _modal;
      ignitionOnModal.show();
    });
  }

  function endRideFailure(message) {
    $ionicLoading.hide();
    var endRideModal;

    if (message && message.search && message.search(/{/) !== -1) {
      message = 'Unable to end your ride. Please try again or call us at (855) 924-8355.';
    }

    $modal('result', {
      icon: 'x-icon',
      title: message,
      actions: [{
        text: 'Ok',
        className: 'button-balanced',
        handler: function () {
          ctrl.ending = false;
          endRideModal.remove();
        }
      }]
    })
    .then(function (_modal) {
      _modal.show();
      endRideModal = _modal;
      endRideModal.show();
    });
  }
}


module.exports = angular.module('app.controllers').controller('DashboardController', [
  '$scope',
  '$rootScope',
  '$injector',
  DashboardController
]);
