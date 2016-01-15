'use strict';
var angular = require('angular');

module.exports = angular.module('app.services').service('$geocoding', [
  '$http',
  function $geocoding ($http) {
    return function geocodingRequest (latitude, longitude) {
      var url = 'http://nominatim.openstreetmap.org/reverse?format=json&zoom=18&addressdetails=1&lat=' + latitude + '&lon=' + longitude;
      return $http.get(url).then(function (response) {
        return response.data;
      });
    };
  }
]);
