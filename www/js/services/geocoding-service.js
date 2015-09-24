'use strict';
var angular = require('angular');

module.exports = angular.module('app.services').factory('$geocoding', [
  '$rootScope',
  '$q',
  '$http',
  function ($rootScope, $q, $http) {
    return {
      getReverseGeoCoding: function (latitude, longitude) {
        var url = 'http://nominatim.openstreetmap.org/reverse?format=json&zoom=18&addressdetails=1&lat=' + latitude + '&lon=' + longitude;
        var defered = $q.defer();
        $http.get(url).success(function (data, status, headers, config) {
          defered.resolve(data);
        })
          .error(function (data, status, headers, config) {
            defered.reject({
              data: data,
              status: status,
              header: headers,
              config: config
            });
          });

        return defered.promise;

      }
    };

  }
]);
