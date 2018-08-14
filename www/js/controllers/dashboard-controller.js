'use strict';
var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');

require('../services/progress-service');
require('../services/geofencing-service');
require('../services/notification-service');
require('../services/chargers-service');

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
  var $session = $injector.get('$session');
  var GeofencingService = $injector.get('GeofencingService');
  //var ZendriveService = $injector.get('ZendriveService');
  var LocationService = $injector.get('LocationService');
  var ChargersService = $injector.get('ChargersService');
  //var homebase = $injector.get('homebase');
  var $auth = $injector.get('$auth');


  // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
  $scope.data = $data.active;
  $scope.service = $ride;
  var ctrl = this;
  this.locations = $data.instances.locations;
  this.fitMapBoundsByMarkers = featured(this.locations);
  this.$data = $data;

  this.openPopover = openPopover;
  this.closePopover = closePopover;
  this.lockCar = lockCar;
  this.unlockCar = unlockCar;
  this.endRide = endRide;
  this.showUnlockChargerPrompt = showUnlockChargerPrompt;
  this.reserveParking = reserveParking;
  this.cancelParking = cancelParking;

  // State
  this.ending = false;
  this.locking = false;
  this.unlocking = false;

  this.lastTimeOfParityCheck = null;
  this.lastUserLocations = [];
  this.parityCheckTimeout = null;
  this.parkingReservationTime = null;

  this.getDirections = function(option) {
    var toGet = option ? option : ctrl.selectedItem;
    $ride.openDirections(toGet, toGet.name);
  }

  // So there was a bug when this thing wasn't running right ... so
  // we need to put it in an interval BUUT sometimes it was so we
  // need to avoid getting this thing to run multiple times
  var rideServiceReady = $scope.$watch('service.isInitialized', function(isInitialized) {
    if (isInitialized !== true) {
      return;
    }
    rideServiceReady();
    $data.resources.parking.fetchReservation({userId: $data.me.id}).$promise.then(function(parking){
      $data.reservedParking = parking;
      ctrl.parkingReservationTime = startParkingTimer(parking.reservation.createdAt);
    });

    ctrl.locations = $data.instances.locations;
    if ($data.active.cars) {
      OnLockStateChange($data.active.cars.isLocked);
    }

    var stopLocationWatch = LocationService.watchLocation(function (currentLocation, callCount) {
      if (!callCount) {
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
        var format = "mm:ss", prepend = "";
        left = Math.abs(left);

        if(left > 60 * 60 * 1000) {
          format = "H:" + format;
          if(left > 24 * 60 * 60 * 1000) {
            prepend = Math.floor(left / (24 * 60 * 60 * 1000)) + 'd ';
          }
        }

        this.timeLeft = 'Extra: ' + prepend + moment.utc(left).format(format);
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
    ctrl.license = $data.active.cars.license;

    // These two lines make it crash!!!!!!!!
    $timeout(function() {
      $data.resources.cars.connect({id: $data.active.cars.id}).catch(function(){
        console.log("can't find car.");
      });
    }, 1000);
    //ZendriveService.start($session.get('me'), $data.active.bookings.id, $data.active.cars.id);

    /*
    $scope.$watch(function() {
      return $data.active.cars.isLocked
    }, OnLockStateChange);
    */

  }.bind(this));

  function OnLockStateChange(isLocked) {
    if (isLocked) {
      var lockedCarMarker = {
        type: "locked-car",
        latitude: $data.active.cars.latitude,
        longitude: $data.active.cars.longitude
      };
      ctrl.locations = $data.instances.locations.concat([lockedCarMarker]);
    } else {
      ctrl.locations = $data.instances.locations;
    }
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

  function doLock(id, state) {
    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    if (!ctrl.locking) {
      ctrl.locking = true;
      $ride[ state ? 'lockCar' : 'unlockCar'](id)
        .then(function (car) {

          OnLockStateChange(car.isLocked);

          ctrl.locking = false;
          $ionicLoading.hide();
        })
        .catch(function (reason) {
          $ionicLoading.hide();
          ctrl.locking = false;
          if(state) {
            $message.error("Locking Failed. <b>Car did not lock!</b><br/>Please repark and try again.");
          } else {
            $message.error("Unlocking failed. Please make sure you're next to the car and try again.");
          }
        });
     }
  }

  function OnCarChargeChange(isLocked) {
    //todo: add new marking for charging car
  }

  function unlockCharger(chargerId) {
    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });
    $ride.unlockCharger($data.active.cars.id, chargerId)
      .then(function(car) {
        OnCarChargeChange(car.isCharging);
        console.log(car);
        $ionicLoading.hide();
    })
    .catch(function (reason) {
        $ionicLoading.hide();
        $message.error("Charger unlocking failed. Please make sure you're connected to available EVSE connector.");
    });
  }

  function showUnlockChargerPrompt(id){
    var modal;
    $modal('result', {
      icon: 'x-icon',
      title: 'Charging Station',
      message: 'Do you wanna unlock charger?',
      actions: [{
        text: 'yes',
        className: 'button-balanced',
        handler: function () {
          modal.remove();
          unlockCharger(id);
        }
      }, {
        text: 'no',
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

  function lockCar(id) {
    return doLock(id, true);
  }

  function unlockCar(id) {
    return doLock(id, false);
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
      longitude: location.longitude,
      accuracy: location.accuracy
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

  function showZonePrompt(locZone, onOkayCallback) {
    var zoneModal;
    var days = [
      'ALL', 'MON', 'TUE', 'WED',
      'THU', 'FRI', 'SAT', 'SUN'
    ];
    var restrictions;

    if(locZone.restrictions) {
      restrictions = locZone.restrictions.map(function (x) {
        var from = x[0];
        var to = x[1];
        return {
          from: days[x[0].day] +  moment(new Date(0, 0, 0, from.hour, from.minute)).format(' hh:mmA'),
          to:   days[x[1].day] + moment(new Date(0, 0, 0, to.hour, to.minute)).format(' hh:mmA')
        };
      })
    }

    $modal('zone', {
      title: 'Zone description',
      zoneName: locZone.name,
      description: locZone.description,
      restrictions: restrictions,
      actions: [{
        text: "Ok, I'm responsible for these rules",
        className: 'button-dark',
        handler: function () {
          zoneModal.remove();
          onOkayCallback();
        }
      }, {
        text: "No thanks, I'll end it elsewhere",
        className: 'button-balanced',
        handler: function () {
          zoneModal.remove();
          
        }
      }]
    }).then(function (_modal) {
      zoneModal = _modal;
      zoneModal.show();
    });
  }

  function endRide(carId, bookingId, attempt) {
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
      console.log('reserved: ', $data.reservedParking);
      if ($data.reservedParking !== null) {
        console.log('user has a parking reservation');
        // confirm if the user is or is not at reservation 
        confirmParking(function(){
          return $state.go('end-ride', { id: bookingId });
        }); 
      }

      return $data.resources.bookings.canend({id: bookingId}).$promise.then(function(endLocation) {
        if (endLocation.type === 'hub' || endLocation.type === 'homebase') {
          return $ride.processEndRide().then(function() {
            return $state.go('end-ride', { id: bookingId });
          });
        } else if(endLocation.type === 'zone') {
          return showZonePrompt(endLocation, function () {
            return $state.go('end-ride-location', { id: bookingId, zone: endLocation })
          });
        } 
          /*
        else {
          // Not inside geofence -> show error
          if ($ride.isChargeOkay(carId, obj)) {
            return $q.reject('Looks like you\'re outside of the rental zone. Please head back to end your rental.');
          }
          return $q.reject('Looks like the charge is pretty low. Please head to the nearest hub or charger!');
        }
          */
      }).then($ionicLoading.hide)
        .catch(endRideFailure);
    }).catch(function(obj) {
      $ionicLoading.hide();
      if(!attempt) {
        attempt = 1;
      }
      console.log("Unable to end the ride, trying again shortly (" + attempt + ")");
      $timeout(function() {
        endRide(carId, bookingId, attempt + 1);
      }, 500);
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
    if('data' in message && 'message' in message.data) {
      message = message.data.message;
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

  function reserveParking(id) {
    // TODO: make sure that parking reservations are nullified after the ride ends
    var modal;
    return $data.resources.parking.findByLocation({locationId: id}).$promise.then(function(parking){
      return $data.resources.parking.reserve({id: parking.id, userId: $data.me.id}).$promise.then(function(space){
        startParkingTimer(space.reservation.createdAt);
        ctrl.selectedItem = null;
        $data.reservedParking = space;
        $modal('simple-modal', {
          title: 'Parking Reserved',
          message: 'You have reserved a parking space at ' + space.location.address + '. Your reservation will expire in 5 minutes.',
        }).then(function (_modal) {
          modal = _modal;
          modal.show();
        });
      })
      .catch(function(error) {
        $modal('simple-modal', {
          title: 'Parking Reservation Failed',
          message: 'Your reservation at ' + space.location.address + ' has failed. ' + error.message,
        }).then(function (_modal) {
          modal = _modal;
          modal.show();
        });

      });
    });
  }

  function cancelParking(id) {
    var modal;
    var address = $data.reservedParking.location.address;
    $modal('simple-modal', {
      title: 'Parking Reservation Cancelled',
      message: 'You have cancelled or reservation for the parking space at ' + address + '.' ,
    }).then(function (_modal) {
      modal = _modal;
      modal.show();
    });
    return $data.resources.parking.cancel({id: id, reservationId: $data.reservedParking.reservation.id}).$promise.then(function(response){
      $data.reservedParking = null;
      ctrl.parkingReservationTime = null;
    })
    .catch(function(error) {
      $modal('simple-modal', {
        title: 'Cancellation Failed',
        message: 'You cancellation of your reservation for the parking space at ' + address + ' has failed.' + error.message ,
      }).then(function (_modal) {
        modal = _modal;
        modal.show();
      });
    });
  }

  function startParkingTimer(createdAt) {
    // This starts a timer for the parking reservation that will cause the reservation to 
    // expire on the client side if the expiration is not emitted on time from the server.
    // Sometimes the expiration of the parking reservation is emitted after the amount of
    // time that it is supposed to take
    var expiration = moment(createdAt);
    expiration.add(5, 'minutes');
    var duration = moment.duration(expiration.diff(moment()))
    ctrl.parkingReservationTime = moment(duration.asMilliseconds()).format('m:ss');
    var interval = setInterval(function(){
      if ($data.reservedParking === null) {
        clearInterval(interval);
      }
      duration.subtract(1, 'second');
      var newTime = moment(duration.asMilliseconds()).format('m:ss');
      if (newTime === '0:00') {
        clearInterval(interval);
        // This conditional is here so that two modals don't pop up when the reservation expires. 
        // The other modal that could pop up for the same event comes from the data service
        if ($data.reservedParking) { 
          var modal;
          $modal('simple-modal', {
            title: 'Expired Parking',
            message: 'Your most recent parking reservation has expired.',
          }).then(function (_modal) {
            modal = _modal;
            modal.show();
          });
          $data.reservedParking = null;
        }
      }
      ctrl.parkingReservationTime = newTime;
    }, 1000);
  }

  function confirmParking(cb) {
    var modal;
    $modal('zone', {
      title: 'Is UserParking',
      zoneName: 'Parking Confirmation',
      description: 'Are you ending your ride in the parking that you reserved?',
      actions: [{
        text: 'Yes my car is in the space I reserved',
        className: 'button-dark',
        handler: function () {
          modal.remove();
          cb();
        }
      }, {
        text: 'No, I am ending it elsewhere',
        className: 'button-balanced',
        handler: function () {
          modal.remove();
          ctrl.cancelParking($data.reservedParking.id);
        }
      }, {
        text: 'I would like to cancel ending now',
        className: 'button-balanced',
        handler: function() {
          modal.remove();  
        }
      }]
    }).then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  }
}


module.exports = angular.module('app.controllers').controller('DashboardController', [
  '$scope',
  '$rootScope',
  '$injector',
  DashboardController
]);
