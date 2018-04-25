/* global navigator */
'use strict';
var angular = require('angular');
var _ = require('lodash');
require('./permission-service');

function LocationService ($rootScope, $cordovaGeolocation, $q, $message, $window, $injector, $timeout) {
  this.setManualPosition = function setManualPosition (latitude, longitude) {
    this.manualPosition = {
      latitude: latitude,
      longitude: longitude
    };
  };

  var $perm = $injector.get('PermissionService');
  var $modal = $injector.get('$modal'), modal;
  var activeLocationWatchers = [];

  var diagnostic = $window.cordova ? $window.cordova.plugins.diagnostic || false : false;

  this.getLocation = function getLocation () {
    return $q.resolve($rootScope.currentLocation);
  };

  this.getCurrentLocation = function getLocation () {
    return $q.resolve($rootScope.currentLocation);
  };

  function askUserToEnableLocation(cb) {
    if(!modal || !modal.isShown()) {
      $modal('simple-modal', {
        title: 'Please Enable Location Settings',
        message: 'You need to enable location settings to use WaiveCar.',
        close: function () {
          diagnostic.switchToSettings();
          cb();
        }
      }).then(function (_modal) {
        modal = _modal;
        modal.show();
      });
    }
  }

  function enableLocation(cb) {
    diagnostic.isLocationAuthorized(function(res) {
      if(res) {
        return cb();
      }
      diagnostic.isLocationEnabled(function(res1) {
        if(res1) {
          return askUserToEnableLocation(cb);
        }
        $window.cordova.plugins.locationAccuracy.canRequest(function(canRequest) {
          if(canRequest) {
            $window.cordova.plugins.locationAccuracy.request(function(){
              cb();
            }, function() {
              return false;
            });
          }
        });
      });
    });
  };

  var MOVETHRESHOLD = 0.000008;

  var hasMoved = this.hasMoved = function (last, current) {
    var isMoved = false, distance = false;
    if(! last.latitude ) {
      isMoved = true;
      distance = true;
    } else {
      distance = (Math.abs(last.latitude - current.latitude) + Math.abs(last.longitude - current.longitude));
      isMoved = distance > MOVETHRESHOLD; 
    }

    if(isMoved) {
      last.latitude = current.latitude;
      last.longitude = current.longitude;
    }

    return isMoved ? distance : false;
  }

  this.watchLocation = function watchLocation (updateCallback) {
    var isInitialCall = true;
    var watchId = false;
    var isActive = true;
    var startTime = new Date();
    var res = {};
    var last = {};

    var invokeCallback = function(location) {
      updateCallback(location, isInitialCall);
      isInitialCall = false;
    };

    var tryAgain = function() {
      res.stop();
      watchLocation(updateCallback);
    }
    /*
    if ($rootScope.currentLocation) {
      invokeCallback($rootScope.currentLocation);
    }
    */

    watchId = navigator.geolocation.watchPosition(function (position) {
      $timeout(function(){
        if(hasMoved(last, position)) {
          var location = update(position);
          invokeCallback(location);
        }
      });
    }, function() {
      if(new Date() - startTime < 500) {
        enableLocation(tryAgain);
      } else {
        tryAgain();
      }
    }, {
      maximumAge: 3000,
      timeout: 10000,
      enableHighAccuracy: true
    });

    activeLocationWatchers.push(watchId);

    res = function () {
      activeLocationWatchers = _.without(activeLocationWatchers, watchId);
      navigator.geolocation.clearWatch(watchId);
      isActive = false;
    };
    res.isActive = function() {
      return isActive;
    };
    res.stop = res;

    return res;
  };

  function update (position) {
    if (position.coords) {
      position = position.coords;
    }

    if (!(position.latitude && position.longitude)) {
      console.error('Tried to set location but object is malformed ', position);
    } else {
      // this is done because the "position" object isn't a generic object and
      // it needs to be "cleansed"
      $rootScope.currentLocation = {
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy
      };
      //console.log('[location-service] updating location to', $rootScope.currentLocation);
    }
    return $rootScope.currentLocation;
  }
  
  function convertLatLonArrToXY(arr, averageLat) {
    
    var toRadians = Math.PI / 180;
    
    return {
      x: arr[0] * toRadians * Math.cos(averageLat * toRadians),
      y: arr[1] * toRadians
    };
  }
  
  function getDistanceToLine(point, lineNormal, pointOnLine) {
    
    // using line equation  ax + by + c that return distance from point (x, y) to to line
    // where a = lineNormal.x
    //       b = lineNormal.y
    //       c = - lineNormal.x * pointOnLine.x - lineNormal.y * pointOnLine.y
    
    return lineNormal.x * point.x + lineNormal.y * point.y
      - lineNormal.x * pointOnLine.x - lineNormal.y * pointOnLine.y;
  }
  
  function normalize(normal) {
    var length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
    normal.x /= length;
    normal.y /= length;
  }
  
  // [lng, lat] formatted array
  this.getDistanceToParkingLine = function(aPolar, bPolar, carPolar) {
    
    var averageLat = (aPolar[1] + bPolar[1] + carPolar[1]) / 3;
    
    var a = convertLatLonArrToXY(aPolar, averageLat);
    var b = convertLatLonArrToXY(bPolar, averageLat);
    var car = convertLatLonArrToXY(carPolar, averageLat);
    
    var abNormal = {
      x: (b.y - a.y),
      y: (a.x - b.x)
    };
    
    normalize(abNormal);
    var carNormal = {
      x: -abNormal.y,
      y: abNormal.x
    };
    
    var distanceToCar = Math.abs(getDistanceToLine(car, abNormal, a));
    var distanceToA   = getDistanceToLine(a, carNormal, car);
    var distanceToB   = getDistanceToLine(b, carNormal, car);
  
    // point A and B are on different sides of line going through car if distanceToA and distanceToB have difference sign
    // thing mean that car is between A and B so distance is distance from car to AB line
    if (distanceToA * distanceToB < 0) {
      return distanceToCar * 6.371e6;
    } else {
      var distanceToNearestABEnd = Math.min(Math.abs(distanceToA), Math.abs(distanceToB));
      
      return Math.max(distanceToCar, distanceToNearestABEnd) * 6.371e6;
    }
  }
}

module.exports = angular.module('app.services').service('LocationService', [
  '$rootScope',
  '$cordovaGeolocation',
  '$q',
  '$message',
  '$window',
  '$injector',
  '$timeout',
  LocationService
]);
