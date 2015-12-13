'use strict';
var angular = require('angular');
require('./message-service');

module.exports = angular.module('app.services').factory('$endRide', [
  '$auth',
  '$data',
  '$state',
  '$message',
  function($auth, $data, $state, $message) {

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
        keyIn        : { isVisible: true, confirmed: false },
        ignitionOff  : { isVisible: true, confirmed: false },
        chargeCardIn : { isVisible: true, confirmed: false },
        isCharging   : { isVisible: false, confirmed: false }
      },
    };
    /*eslint-enable */

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
          service.state.check.keyIn.isVisible = false;
          service.state.check.ignitionOff.isVisible = false;
          service.state.check.chargeCardIn.isVisible = false;
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

    service.process = function(form) {
      console.log(form);
    };

    service.toggleZone = function() {
      service.state.zone.confirmed = false;
      service.state.zone.isOutside = !service.state.zone.isOutside;
    };

    service.confirmOutsideZone = function() {
      service.state.zone.confirmed = true;
    };

    service.setCheck = function(key) {
      service.state.check[key].confirmed = true;
      var isReady = false;
      for(var index in service.state.check) {
        if (service.state.check.hasOwnProperty(index)) {
          var item = service.state.check[index];
          if (item.isVisible && item.confirmed === false) {
            isReady = false;
          } else {
            isReady = true;
          }
        }
      }

      if (isReady !== service.state.readyToEnd) {
        service.this.state.readyToEnd = isReady;
      }
    };

    service.processEndRide = function() {
      $data.resources.bookings.end({ id: service.state.booking.id }).$promise.then(function() {
        $data.fetch('bookings');
        $data.deactivate('bookings');
        $message.success(service.state.booking.id + ' has been successfully ended');
      }).catch($message.error);
    };

    service.lockCar = function(id) {
      $data.resources.cars.lock({ id: id }).$promise.then(function() {
        $data.deactivate('cars');
        $message.success(id + ' has been successfully locked');
      }).catch($message.error);
    };

    service.setState();

    return service;
  }
]);
