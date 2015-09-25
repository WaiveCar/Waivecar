'use strict';
var angular = require('angular');
require('../../../providers/maps-loader-provider');

module.exports = angular.module('Maps').service('RealReachService', [
  '$rootScope',
  'MapsLoader',
  '$q',
  '$http',
  'LocationService',
  '$window',
  function ($rootScope, MapsLoader, $q, $http, LocationService, $window) {

    var service = {
      getUrl: function (apiKey) {
        if ($window.cordova) {
          var url = 'http://' + apiKey + '.tor.skobbler.net/tor/RSngx/RealReach/json/18_0/en/' + apiKey;
          return url;
        }
        return 'http://localhost:8100/skoblerRealReach';

      },

      getReachInMinutes: function (minutes, transport) {
        return MapsLoader.getMap.then(function (maps) {
          var defered = $q.defer();

          LocationService.getLocation().then(function (location) {
            var url = service.getUrl(maps.skobbler.apiKey);
            url += '?response_type=gps';
            url += '&units=sec';
            url += '&nonReachable=0';
            url += '&range=' + (minutes * 60);
            url += '&transport=' + transport;
            url += '&start=' + location.latitude + ',' + location.longitude;

            $http.get(url).success(function (data) {
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
          });

          return defered.promise;

        });

      }

    };

    return service;
  }
]);
