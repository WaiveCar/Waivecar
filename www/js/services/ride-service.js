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
  function($auth, $data, $state, $message, $interval) {

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
      location : {
        chargingStation : { isVisible : true, confirmed : false, title : 'Charging Station' },
        homebase        : { isVisible : true, confirmed : false, title : 'WaiveCar Home Lot' },
        valet           : { isVisible : true, confirmed : false, title : 'WaiveCar Valet' },
        other           : { isVisible : true, confirmed : false, title : 'Other' }
      },
      check : {
        isKeySecure        : { isVisible: true,  confirmed: false },
        isIgnitionOn       : { isVisible: true,  confirmed: false },
        isChargeCardSecure : { isVisible: true,  confirmed: false },
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
        default: {
          break;
        }
      }
      $state.go('end-ride-location', { id: service.state.booking.id });
    };

    service.setParkingLocation = function(location, isForm) {
      if (isForm) {
        return $state.go('end-ride', { id: service.state.booking.id });
      }

      debugger; // not yet considered.
    };

    service.toggleZone = function() {
      service.state.zone.confirmed = false;
      service.state.zone.isOutside = !service.state.zone.isOutside;
    };

    service.confirmOutsideZone = function() {
      service.state.zone.confirmed = true;
    };

    service.setCheck = function() {
      if (!$data.active.cars) {
        $interval.cancel(this.checkForLock);
        return;
      }

      if (!$data.active.bookings) {
        $interval.cancel(this.checkForLock);
        return;
      }

      if (service.state.location.valet.confirmed && $data.active.bookings.status === 'completed') {
        var id = $data.active.bookings.id;
        $interval.cancel(this.checkForLock);
        $data.fetch('bookings');
        $data.deactivate('bookings');
        $data.deactivate('cars');
        service.setState();
        $state.go('bookings-show', { id: id });
        return;
      }

      var isReady = false;
      for(var index in service.state.check) {
        if (service.state.check.hasOwnProperty(index)) {
          var item = service.state.check[index];
          if (!item) {
            console.log(index);
          }
          item.confirmed = $data.active.cars[index];
          if (item.isVisible && item.confirmed === false) {
            isReady = false;
          } else {
            isReady = true;
          }
        }
      }

      if (isReady === true && isReady !== service.state.booking.readyToEnd && service.state.location.valet.confirmed === false) {
        if (this.checkForLock) {
          $interval.cancel(this.checkForLock);
        }
        service.state.booking.readyToEnd = isReady;
      }
    };

    service.processEndRide = function() {
      if ($data.active.bookings && $data.active.bookings.status === 'ended') {
        return;
      }

      if (service.state.location.valet.confirmed) {
        this.checkForLock = $interval(function() {
          service.setCheck();
        }, 2000);
        return;
      }

      var payload = angular.copy(service.state.parkingLocation);
      for (var index in service.state.location) {
        if (service.state.location.hasOwnProperty(index)) {
          var item = service.state.location[index];
          if (item.confirmed === true) {
            payload.locationType = item.title;
            break;
          }
        }
      }

      $data.resources.bookings.end({ id: service.state.booking.id, data: payload }).$promise.then(function() {
        $data.fetch('bookings');
        this.checkForLock = $interval(function() {
          service.setCheck();
        }, 2000);
      }.bind(this)).catch($message.error);
    };

    service.processCompleteRide = function() {
      var id = service.state.booking.id;
      $data.resources.bookings.complete({ id: id }).$promise.then(function() {
        $data.fetch('bookings');
        $data.deactivate('bookings');
        $data.deactivate('cars');
        service.setState();
        $state.go('bookings-show', { id: id });
      }).catch($message.error);
    };

    service.lockCar = function(id) {
      $data.resources.cars.lock({ id: id }).$promise.then(function() {
      }).catch($message.error);
    };

    service.unlockCar = function(id) {
      $data.resources.cars.unlock({ id: id }).$promise.then(function() {
      }).catch($message.error);
    };

    service.init = function() {
      console.log('$ride : init');
      service.setState();
      $data.initialize('bookings').then(function() {
        if ($data.instances.bookings.length > 0) {
          var current = _.find($data.instances.bookings, function(b) {
            return !_.contains([ 'cancelled', 'completed', 'closed' ], b.status);
          });
          if (current) {
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
          } else {
            $state.go('cars');
            service.isInitialized = true;
          }
        }
      });
    };

    // service.setState();
    // service.init();

    return service;
  }
]);
