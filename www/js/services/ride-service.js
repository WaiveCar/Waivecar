'use strict';
var angular = require('angular');
var _ = require('lodash');
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
  '$distance',
  '$modal',
  function($auth, $data, $state, $message, $interval, $timeout, $q, $injector, GeofencingService, $distance, $modal) {
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
        isDoorsClosed      : { isVisible: true, confirmed: false },
        isChargeCardSecure : { isVisible: false, confirmed: false },
        isCharging         : { isVisible: false, confirmed: false }
      }
    };
    /*eslint-enable */

    service.isInitialized = false;

    service.setState = function() {
      service.state = {};
      angular.copy(defaultState, service.state);
    };

    service.setBooking = function(id) {
      service.state.booking.id = id;
    };

    service.setLocation = function(key) {
      service.state.location[key].confirmed = true;
      switch (key) {
        case 'chargingStation': {
          service.state.check.isCharging.isVisible = true;
          break;
        }
        case 'valet': {
          service.state.check.isKeySecure.isVisible = false;
          service.state.check.isIgnitionOn.isVisible = false;
          service.state.check.isChargeCardSecure.isVisible = false;
          $state.go('end-ride', { id: service.state.booking.id });
          return;
          break;
        }
        case 'homebase':
        case 'other':
        default:
          break;
      }
      $state.go('end-ride-location', { id: service.state.booking.id });
    };

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
        if (this.checkForLock) {
          $interval.cancel(this.checkForLock);
          this.checkForLock = null;
        }
        return;
      }

      if (service.state.location.valet.confirmed) {
        if (booking.status !== 'completed') {
          return;
        }
        if (this.checkForLock) {
          $interval.cancel(this.checkForLock);
          this.checkForLock = null;
        }
        $data.fetch('bookings');
        $data.deactivate('bookings');
        $data.deactivate('cars');
        service.setState();
        $state.go('bookings-show', { id: booking.id });
        return;
      }

      if (service.state.booking.readyToEnd) {
        if (this.checkForLock) {
          $interval.cancel(this.checkForLock);
          this.checkForLock = null;
        }
        return;
      }

      _.forEach(service.state.check, function (item, key) {
        item.confirmed = car[key];
        if (key === 'isIgnitionOn') {
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
      console.log('ready to end');

      service.state.booking.readyToEnd = true;
      if (this.checkForLock) {
        $interval.cancel(this.checkForLock);
        this.checkForLock = null;
      }
    };

    service.processEndRide = function() {
      if ($data.active.bookings && $data.active.bookings.status === 'ended') {
        $state.go('cars', null, {location: 'replace'});
        return null;
      }

      this.checkForLock = $interval(function() {
        service.setCheck();
      }, 5000);

      $timeout(function(){
        $interval.cancel(this.checkForLock);
      }.bind(this), 5 * 60 * 1000);

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

    // obj is returned by the car and should have a long/lat
    // first and foremost the users' gps is used.
    service.canEndHereCheck = function(car) {
      // if we are in Santa Monica we are good
      return GeofencingService.insideBoundary(car).then(function(isInside) {
        if (isInside) {
          return true;
        }

        // otherwise we need to look for end locations.
        return $data.resources.locations.dropoff().$promise.then(function(locationList) {
          for(var ix = 0; ix < locationList.length; ix++) {
            if ($distance.fallback(locationList[ix], car) * 1760 < locationList[ix].radius) {
              return true;
            }
          }
          return false;
        });

      });

    };

    service.setParkingDetails = function(details) {
      service.state.parkingDetails = details;
    };

    service.processCompleteRide = function() {
      $ionicLoading.show({
        template: '<div class="circle-loader"><span>Loading</span></div>'
      });
      var id = service.state.booking.id;
      if (this.checkForLock) {
        $interval.cancel(this.checkForLock);
        this.checkForLock = null;
      }
      return $data.resources.bookings.complete({ id: id }).$promise
      .then(function() {
        $ionicLoading.hide();
        $data.fetch('bookings');
        $data.deactivate('bookings');
        $data.deactivate('cars');
        service.setState();
        $state.go('bookings-show', { id: id });
      }).catch(function(err) {
        $ionicLoading.hide();
        $message.error(err);
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

    service.isChargeOkay = function(id, obj) {
      // see https://github.com/WaiveCar/Waivecar/issues/828
      // Complaints about the cars not being able to end below 25 miles
      // Really we need to be system-wide consistent with this number.
      return genericCheck(id, obj, function(status) {
        return status.charge > 20 || status.isCharging;
      });
    };

    service.isDoorsClosed = function(id, obj) {
      return genericCheck(id, obj, function(status) {
        return status.isDoorClosed;
      });
    };

    service.lockCar = function(id) {
      return service.isCarOn(id)
        .then(function (isCarOn) {
          if (isCarOn) {
            return $q.reject({code: 'IGNITION_ON'});
          }
          return $data.resources.cars.lock({ id: id }).$promise;
        });
    };

    service.unlockCar = function(id) {
      return service.isCarOn(id)
        .then(function (isCarOn) {
          if (isCarOn) {
            return $q.reject({code: 'IGNITION_ON'});
          }
          return $data.resources.cars.unlock({ id: id }).$promise;
        });
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
        console.log('$ride : init. current: ', current);

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
      });
    };

    service.setState();
    service.init();

    return service;
  }
]);
