'use strict';
var angular = require('angular');

function LocationService ($rootScope, $cordovaGeolocation, $q, $message) {


  this.setManualPosition = function setManualPosition (latitude, longitude) {
    this.manualPosition = {
      latitude: latitude,
      longitude: longitude
    };

    // $rootScope.$broadcast(MapsEvents.positionChanged, this.manualPosition);
  };

  this.initPositionWatch = function initPositionWatch () {
    var posOptions = {
      maximumAge: 3000,
      timeout: 8000,
      enableHighAccuracy: true
    };

    this.watch = $cordovaGeolocation.watchPosition(posOptions)
    .then(null, function (err) {
      $message.error('Please ensure WaiveCar has access to retrieve your Location.');
    }, function (position) {
      console.log(position);
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

    var posOptions = {
      maximumAge: 3000,
      timeout: 8000,
      enableHighAccuracy: true
    };

    return $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
      update(position);
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    }, function (err) {
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
    console.log('updating location to ' + position.latitude + ', ' + position.longitude);
    $rootScope.currentLocation = {
      latitude: position.latitude,
      longitude: position.longitude
    };
    //$rootScope.$broadcast(MapsEvents.positionChanged, $rootScope.currentLocation);
  }

}

module.exports = angular.module('app.services').service('LocationService', [
  '$rootScope',
  '$cordovaGeolocation',
  '$q',
  '$message',
  LocationService
]);
