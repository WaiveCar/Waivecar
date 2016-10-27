'use strict';
var angular = require('angular');
require('./permission-service');

function LocationService ($rootScope, $cordovaGeolocation, $q, $message, $window, $injector) {
  this.setManualPosition = function setManualPosition (latitude, longitude) {
    this.manualPosition = {
      latitude: latitude,
      longitude: longitude
    };
  };

  var $perm = $injector.get('PermissionService');

  this.getLocation = function getLocation () {
    return $q.resolve($rootScope.currentLocation);
  };

  this.getCurrentLocation = function getLocation () {
    if (typeof this.manualPosition !== 'undefined' && this.manualPosition) {
      return $q.resolve(this.manualPosition);
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
      // ignore timeouts
      if (err.constructor.name === 'PositionError' && err.code === 3) {
        return $q.reject();
      }

      $perm.getPermissionsIfNeeded('ACCESS_FINE_LOCATION', $q);

      /*$message.error('We were not able to find your location, please reconnect.');
      $q.reject(err);*/
    });
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
  LocationService
]);
