'use strict';
var angular = require('angular');

function LocationService ($rootScope, $cordovaGeolocation, $q, $message) {


  this.setManualPosition = function setManualPosition (latitude, longitude) {
    this.manualPosition = {
      latitude: latitude,
      longitude: longitude
    };
  };

  this.initPositionWatch = function initPositionWatch () {
    this.watch = $cordovaGeolocation.watchPosition({
      maximumAge: 3000,
      timeout: 8000,
      enableHighAccuracy: true
    })
    .then(null, function (err) {
      console.log(err);
      $message.error('Please ensure WaiveCar has access to retrieve your Location.');
    }, function (position) {
      update(position);
    });
  };

  this.clearWatch = function clearWatch () {
    this.watch.clearWatch();
  };

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
      $message.error('We were not able to find your location, please reconnect.');
      $q.reject(err);
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
    console.log('updating location to %d, %d (~%d)',
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
  LocationService
]);
