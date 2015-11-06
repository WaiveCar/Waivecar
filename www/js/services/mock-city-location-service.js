'use strict';
var angular = require('angular');
var when = require('when');

module.exports = angular.module('app.services').factory('MockLocationService', [
  '$rootScope',
  function ($rootScope) {

    var mockLocation = {
      latitude: 34.0604643,
      longitude: -118.4186743
    };
    var currentLocation;

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

    function update(prevLocation) {
      prevLocation = angular.copy(prevLocation);
      var newLocation = getRandomLocation(prevLocation.latitude, prevLocation.longitude, 20);
      currentLocation = {
        latitude: newLocation[1],
        longitude: newLocation[0]
      };
      $rootScope.currentLocation = currentLocation;

    }

    /* PUBLIC */

    function initPositionWatch() {
      update(mockLocation);
      // setInterval(function(){
      //   update(mockLocation);
      // }, 2000);
    }

    function getLocation() {
      return when(angular.copy(currentLocation));
    }

    function setLocation(location, isFuzzy) {
      isFuzzy = isFuzzy || true;
      var locations;

      if (!isFuzzy) {
        return ($rootScope.currentLocation = angular.clone(location));
      }

      locations = getRandomLocation(location.latitude, location.longitude, 10);
      $rootScope.currentLocation.latitude = locations[1];
      $rootScope.currentLocation.longitude = locations[0];

    }

    return {
      getLocation: getLocation,
      setLocation: setLocation,
      initPositionWatch: initPositionWatch
    };

  }

]);
