'use strict';
var angular = require('angular');

module.exports = angular.module('app.services').factory('$endRide', [
  '$auth',
  '$data',
  '$state',
  function($auth, $data, $state) {

    var service = {};

    /*eslint-disable */
    service.state = {
      car : {
        id     : null,
        charge : 100   // NB. we want to record the charge when the user selects End Ride, not actual Charge.
      },
      booking : {
        id         : null,
        duration   : 0,    // NB. we want to remember duration when user hits End Ride, not actual elapsed time.
        readyToEnd : false
      },
      zone            : { isOutside : false, confirmed : false },
      parking         : {
        addressLine1       : null,
        addressLine2       : null,
        shortDescription   : null,
        isParkingStructure : false,
        level              : null,
        spot               : null
      },
      parkingLocation : {
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

    service.setCar = function(id, charge) {
      service.state.car.id = id;
      service.state.car.charge = charge;
    };

    service.setBooking = function(id, duration) {
      service.state.booking.id = id;
      service.state.booking.duration = duration;
    };

    service.setLocation = function(key) {
      service.state.parkingLocation[key].confirmed = true;
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

    return service;
  }
]);
