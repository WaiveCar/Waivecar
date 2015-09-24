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
      prevLocation.latitude = newLocation[1];
      prevLocation.longitude = newLocation[0];
      $rootScope.currentLocation = prevLocation;

    }

    /* PUBLIC */

    function initPositionWatch() {
      update(mockLocation);
      //setInterval(update, 2000);
    }

    function getLocation() {
      return when.promise(function (resolve) {
        return resolve(angular.copy(mockLocation));
      });

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
