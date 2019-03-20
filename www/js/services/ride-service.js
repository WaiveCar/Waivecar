'use strict';
var angular = require('angular');
var _ = require('lodash');

_.contains = _.includes;
var ionic = require('ionic');
require('./message-service');

module.exports = angular.module('app.services').factory('$ride', [
  '$auth',
  '$data',
  '$state',
  '$message',
  '$interval',
  '$timeout',
  '$q',
  '$injector',
  'GeofencingService',
  'ChargersService',
  '$distance',
  '$modal',
  function($auth, $data, $state, $message, $interval, $timeout, $q, $injector, GeofencingService, ChargersService, $distance, $modal) {
    var $ionicLoading = $injector.get('$ionicLoading');

    var service = {};

    /*eslint-disable */
    var defaultState = {
      booking : {
        id         : null,
        readyToEnd : false
      },
      zone            : { isOutside : false, confirmed : false },
      parkingLocation : {
        addressLine1       : null,
        addressLine2       : null,
        shortDescription   : null,
        isParkingStructure : false,
        level              : null,
        spot               : null
      },
      parkingDetails : {},
      location : {
        chargingStation : { isVisible : true, confirmed : false, title : 'Charging Station' },
        homebase        : { isVisible : true, confirmed : false, title : 'WaiveCar Home Lot' },
        valet           : { isVisible : true, confirmed : false, title : 'WaiveCar Valet' },
        other           : { isVisible : true, confirmed : false, title : 'Other' }
      },
      check : {
        isKeySecure        : { isVisible: true, confirmed: false },
        isIgnitionOn       : { isVisible: true, confirmed: false },
        isDoorOpen         : { isVisible: true, confirmed: false },
        isChargeCardSecure : { isVisible: false, confirmed: false },
        isCharging         : { isVisible: false, confirmed: false }
      }
    };
    /*eslint-enable */

    var checkForLockHandle;
    function checkForLock() {
      if (checkForLockHandle) {
        $interval.cancel(checkForLockHandle);
        checkForLockHandle = null;
      }
    }

    service.isInitialized = false;

    service.setState = function() {
      service.state = {};
      angular.copy(defaultState, service.state);
    };

    service.setBooking = function(id) {
      service.state.booking.id = id;
    };

    service.openDirections = function(what, label) {
      var isIOS = ionic.Platform.isIOS();
      var append = '';
      var geocoords = what.latitude + ',' + what.longitude;

      if (isIOS) {
        window.open('maps://?q=' + geocoords, '_system');
      } else {
        if(label) {
          append = '(' + encodeURI(label) + ')';
        }
        window.open('geo:0,0?q=' + geocoords + append, '_system');
      }
    }

    service.toggleZone = function() {
      service.state.zone.confirmed = false;
      service.state.zone.isOutside = !service.state.zone.isOutside;
    };

    service.confirmOutsideZone = function() {
      service.state.zone.confirmed = true;
    };

    service.setCheck = function() {
      var car = $data.active.cars;
      var booking = $data.active.bookings;
      $data.resources.cars.refresh({id: car.id});

      if (car == null || booking == null) {
        checkForLock();
        return;
      }

      if (service.state.location.valet.confirmed) {
        if (booking.status !== 'completed') {
          return;
        }
        checkForLock();
        $data.fetch('bookings');
        $data.deactivate('bookings');
        $data.deactivate('cars');
        service.setState();
        $state.go('bookings-show', { id: booking.id });
        return;
      }

      if (service.state.booking.readyToEnd) {
        checkForLock();
        return;
      }

      _.forEach(service.state.check, function (item, key) {
        item.confirmed = car[key];
        if (key === 'isIgnitionOn' || key === 'isDoorOpen') {
          item.confirmed = !car[key];
        }
      });

      var isReady = _(service.state.check)
        .every(function (item) {
          return item.confirmed || !item.isVisible;
        });

      if (!isReady) {
        return;
      }

      service.state.booking.readyToEnd = true;
      checkForLock();
    };

    service.processEndRide = function() {
      if ($data.active.bookings && $data.active.bookings.status === 'ended') {
        $state.go('cars', null, {location: 'replace'});
        return $q.when(true);
      }

      checkForLockHandle = $interval(function() {
        service.setCheck();
      }, 5000);

      $timeout(function(){
        $interval.cancel(checkForLockHandle);
      }, 5 * 60 * 1000);

      var payload = angular.copy(service.state.parkingLocation);
      var locationType = _.find(service.state.location, function (item) {
        return item.confirmed === true;
      });
      if (locationType != null) {
        payload.locationType = locationType.title;
      }

      return $data.resources.bookings.end({ id: service.state.booking.id, data: service.state.parkingDetails }).$promise
        .then(function(result) {
          if (!result.isCarReachable) {
            return pendingEndInstructionDialog();
          }
        })
        .then(function() {
          return $data.fetch('bookings');
        })
        .catch(function(err) {
          $ionicLoading.hide();
          $message.error(err);
        });
    };

    function pendingEndInstructionDialog() {

      var instructions =
        'Hi to end your ride, please complete the following steps!<br/>' +

        '  1.Open the door and get in the car, leaving the door open.<br/>' +
        '  2.Remove the keys from the glove compartment, press the lock button.<br/>' +
        '  3.Put the key back in the holder where it belongs.<br/>' +
        '  4.Please make sure the keys are in the glovebox and get out of the car and close the door.<br/>' +
        '  5.Please make sure the door is now locked. If not, please try these steps again and remember to keep the door open as you press the lock button.<br/>' +
        '  6.If there are additional issues, feel free to call us.<br/><br/>' +

        'Press "I\'m done" when you\'ve done these steps to end the ride.';

      var modal;
      var resolvePromise;

      $modal('result', {
        icon: 'waivecar-mark',
        message: instructions,
        actions: [{
          className: 'button-dark',
          text: 'I\'m Done ',
          handler: function () {
            modal.remove();

            $ionicLoading.show({
              template: '<div class="circle-loader"><span>Loading</span></div>'
            });

            resolvePromise();
          }
        }]
      }).then(function (_modal) {
        modal = _modal;
        $ionicLoading.hide();
        modal.show();
      });

      return $q(function(resolve){
        resolvePromise = resolve;
      });
    }

    service.setParkingDetails = function(details) {
      service.state.parkingDetails = details;
    };

    service.processCompleteRide = function() {
      $ionicLoading.show({
        template: '<div class="circle-loader"><span>Loading</span></div>'
      });
      var id = service.state.booking.id;
      checkForLock();
      return $data.resources.bookings.complete({ id: id }).$promise
      .then(function() {
        $ionicLoading.hide();
        $data.resources.cars.disconnect();
        // $data.fetch('bookings');
        $data.deactivate('bookings');
        $data.deactivate('cars');
        service.setState();
        $state.go('bookings-show', { id: id });
      }).catch(function(err) {
        $ionicLoading.hide();
        $message.error(err);
      });
    };

    service.checkAndProcessActionOnBookingEnd = function() {

      return $data.resources.bookings.getEndBookingActions({ userId: $auth.me.id })
        .$promise.then(function(result) {
          var loadUrl = null;

          if (result.action) {
            result.action.forEach(function (action) {
              if (Array.isArray(action) && action.length === 2 && action[0] === 'loadUrl') {
                loadUrl = action[1];
              }
            });
          }
          if (loadUrl) {

            $data.onActionNotification = function(action) {
              if (action.name === 'endBooking') {
                $data.onActionNotification = null;
                service.processCompleteRide();
              }
            };
            $state.go('blocker', {url: loadUrl, title: 'Quick Survey'});


          } else {
            service.processCompleteRide()
          }
        });
    };

    function genericCheck(id, obj, check) {
      if (obj) {
        return check(obj);
      }

      return service.getStatus(id).then(check);
    }

    service.getStatus = function (id) {
      return $data.resources.cars.refresh({ id: id }).$promise;
    };

    service.isCarOn = function (id, obj) {
      return genericCheck(id, obj, function(status) {
        return status.isIgnitionOn;
      });
    };

    service.lockCar = function(id) {
      return $data.resources.cars.lock({ id: id });
    };

    service.unlockCar = function(id) {
      return $data.resources.cars.unlock({ id: id });
    };

    service.startCharge = function(carId, chargerId) {
      return $data.resources.chargers.startCharge({ carId: carId, chargerId: chargerId }).$promise;
    };

    service.init = function(current) {
      service.setState();
      $data.initialize('bookings').then(function(bookings) {
        if(!current) {
          current = _(bookings)
            .filter({userId: $auth.me.id})
            .find(function (b) {
              return !_.contains([ 'cancelled', 'completed', 'closed'], b.status);
            });
        }

        console.log('$ride : init. current: ', current, current ? current.status : false , $state.current.name);

        if (current == null) {
          $state.go('cars');
          service.isInitialized = true;
          return;
        }
        service.setBooking(current.id);
        $data.activate('bookings', current.id).then(function() {
          $data.activate('cars', current.carId).then(function() {
            service.isInitialized = true;
            service.setCheck();
            if (current.status === 'reserved' && $state.current.name !== 'bookings-active') {
              $state.go('bookings-active', { id: current.id });
            } else if (current.status === 'ready' && $state.current.name !== 'start-ride') {
              $state.go('start-ride', { id: current.id });
            } else if (current.status === 'started' && $state.current.name !== 'dashboard') {
              $state.go('dashboard', { id: current.id });
            } else if (current.status === 'ended' && $state.current.name !== 'end-ride') {
              $state.go('end-ride', { id: current.id });
            }
          });
        });
      })
    };

    service.setState();

    // This should be done through the authentication mechanisms.
    // service.init();

    return service;
  }
]);
