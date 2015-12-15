'use strict';
var angular = require('angular');

function LocationService ($rootScope, $injector) {
  var $q = $injector.get('$q');
  var MapsEvents = $injector.get('MapsEvents');

  var mockLocation = {
    latitude: 34.0604643,
    longitude: -118.4186743
  };

  /* PUBLIC */

  this.initPositionWatch = function initPositionWatch() {
    update(mockLocation);
  };

  this.getLocation = function getLocation() {
    return $q.when($rootScope.currentLocation);
  };

  this.getCurrentLocation = function getCurrentLocation () {
    return $q.when($rootScope.currentLocation);
  };

  this.setLocation = function setLocation(location, isFuzzy) {
    isFuzzy = isFuzzy || true;
    location = location;
    var locations;

    if (!isFuzzy) {
      return ($rootScope.currentLocation = angular.clone(location));
    }

    locations = getRandomLocation(location.latitude, location.longitude, 10);
    $rootScope.currentLocation.longitude = locations[0];
    $rootScope.currentLocation.latitude = locations[1];
  };

  function update (position) {
    console.log('updating location to ' + position.latitude + ', ' + position.longitude);
    $rootScope.currentLocation = {
      latitude: position.latitude,
      longitude: position.longitude
    };
    $rootScope.$broadcast(MapsEvents.positionChanged, $rootScope.currentLocation);
  }
}

function getRandomLocation(x0, y0, radius) {
  var radiusInDegrees = radius / 111300;

  var u = Math.random();
  var v = Math.random();
  var w = radiusInDegrees * Math.sqrt(u);
  var t = 2 * Math.PI * v;
  var x = w * Math.cos(t);
  var y1 = w * Math.sin(t);
  var x1 = x / Math.cos(y0);

  return [(y0 + y1), (x0 + x1)];
}

module.exports = angular.module('app.services').service('MockLocationService', [
  '$rootScope',
  '$injector',
  LocationService
]);
