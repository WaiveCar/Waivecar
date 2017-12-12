'use strict';
var angular = require('angular');
var _ = require('lodash');
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
  '$distance',
  function($auth, $data, $state, $message, $interval, $timeout, $q, $injector, GeofencingService, $distance) {
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
        .then(function() {
          return $data.fetch('bookings');
        })
        .catch(function(err) {
          $ionicLoading.hide();
          $message.error(err);
        });
    };

    // obj is returned by the car and should have a long/lat
    // first and foremost the users' gps is used.
    service.canEndHereCheck = function(car) {
      return $data.resources.locations.dropoff().$promise.then(function(locationList) {
        // We have order precendence here ... 
        var METERTOFEET = 3.28084;
        var precedence = {
          none: 0,
          zone: 1,
          hub: 2,
          homebase: 3
        };
        var type = 'none';

        // If the charge isn't ok then we can only end at hubs, not zones.
        if(!service.isChargeOkay(car.id, car)) {
          locationList = locationList.filter(function(location) { return location.type === 'hub'; });
        }

        for(var ix = 0; ix < locationList.length; ix++) {
          var location = locationList[ix];
          if (precedence[location.type] > precedence[type] && (
                location.radius && $distance.fallback(location, car) * METERTOFEET < location.radius ||
                location.shape && GeofencingService.insideFastCheck(car, location.shape)
              ) 
          ) {
            type = location.type;
          }
        }
        if (type === 'none') {
          return false;
        }
        return type;
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
        $data.resources.cars.disconnect();
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
      return $data.resources.cars.lock({ id: id });
    };

    service.unlockCar = function(id) {
      return $data.resources.cars.unlock({ id: id });
    };

    service.init = function(current) {
      if(service._init) {
        console.log('Double entry $ride.init');
        return;
      }
      service._init = true;

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
      })
    };

    service.setState();

    // This should be done through the authentication mechanisms.
    // service.init();

    return service;
  }
]);
