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

  var $this = this;
  var $perm = $injector.get('PermissionService');
  var $modal = $injector.get('$modal'), modal;
  this.activeLocationWhatchers = []

  var diagnostic = $window.cordova ? $window.cordova.plugins.diagnostic || false : false;

  this.getLocation = function getLocation () {
    return $q.resolve($rootScope.currentLocation);
  };

  function askUserToEnableLocation() {
    $modal('simple-modal', {
      title: 'Please Enable Location Settings',
      message: 'You need to enable location settings to use WaiveCar.',
      close: function () {
        diagnostic.switchToSettings();
      }
    }).then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  }

  this.enableLocation = function() {
    diagnostic.isLocationAuthorized(function(res) {
      if(res) {
        return;
      }
      diagnostic.isLocationEnabled(function(res1) {
        if(res1) {
          return askUserToEnableLocation();
        }
        $window.cordova.plugins.locationAccuracy.canRequest(function(canRequest) {
          if(canRequest) {
            $window.cordova.plugins.locationAccuracy.request(function(){
              console.log('ios dialog');
            }, function() {
              return false;
            });
          }
        });
      });
    });
  };

  this.getCurrentLocation = function getLocation () {

    if (this.activeLocationWhatchers.length > 0) {
      return $q.resolve($rootScope.currentLocation);
    }

    return $cordovaGeolocation.getCurrentPosition({
      maximumAge: 3000,
      timeout: 8000,
      enableHighAccuracy: true
    })
    .then(function (position) {
      update(position);
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.accuracy
      };
    })
    .catch(function (err) {
      $perm.getPermissionsIfNeeded('ACCESS_FINE_LOCATION');
      $window.console.log(err);
      // ignore timeouts
      if (err.constructor.name === 'PositionError' && err.code === 3) {
        return $q.reject();
      }

      $this.enableLocation();

      /*$message.error('We were not able to find your location, please reconnect.');
      $q.reject(err);*/
    });
  };

  this.watchLocation = function watchLocation (updateCallback) {

    var watch = navigator.geolocation.watchPosition(function onPosition (position) {
      $timeout(function(){
        var location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        update(location);
        updateCallback(location);
      });
    }, function onPositionErr (err) {
      LocationService.enableLocation();
    }, {
      maximumAge: 3000,
      timeout: 10000,
      enableHighAccuracy: true
    });


    $this.activeLocationWhatchers.push(watch);

    return function stopWatch() {
      $this.activeLocationWhatchers = _.without($this.activeLocationWhatchers, watch);
      navigator.geolocation.clearWatch(watch);
    };
  };


  function update (position) {
    if (position.coords) {
      position = position.coords;
    }
    if (!(position.latitude && position.longitude)) {
      console.error('Tried to set location but object is malformed ', position);
      return;
    }
    console.log('[location-service] updating location to %d, %d (~%d)',
                position.latitude, position.longitude, position.accuracy);
    $rootScope.currentLocation = {
      latitude: position.latitude,
      longitude: position.longitude,
      accuracy: position.accuracy
    };
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
