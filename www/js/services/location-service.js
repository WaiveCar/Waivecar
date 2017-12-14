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

  this.watchLocation = function watchLocation (updateCallback) {
    var isInitialCall = true;
    var watchId = false;
    var isActive = true;
    var startTime = new Date();
    var res = {};

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
        var location = update(position);
        invokeCallback(location);
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
