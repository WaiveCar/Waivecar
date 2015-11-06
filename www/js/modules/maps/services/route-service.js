'use strict';
var angular = require('angular');
require('../../../providers/maps-loader-provider');

module.exports = angular.module('Maps').service('RouteService', [
  '$rootScope',
  'MapsLoader',
  '$q',
  '$http',
  'MapsEvents',
  'skobblerApiCodes',
  '$window',
  function ($rootScope, MapsLoader, $q, $http, MapsEvents, skobblerApiCodes, $window) {
    var service = {

      getUrl: function (apiKey) {
        // if ($window.cordova) {
          var url = 'http://' + apiKey + '.tor.skobbler.net/tor/RSngx/calcroute/json/18_0/en/' + apiKey;
          return url;
        // }
        // return 'http://localhost:8100/skoblerCalcRoute';

      },

      getRoute: function (pointA, pointB, profile) {
        profile = profile || 'pedestrian';

        return MapsLoader.getMap.then(function (maps) {
          var url = service.getUrl(maps.skobbler.apiKey);

          url += '?start=' + (pointA.lat || pointA.latitude) + ',' + (pointA.lng || pointA.longitude);
          url += '&dest=' + (pointB.lat || pointB.latitude) + ',' + (pointB.lng || pointB.longitude);
          url += '&profile=' + profile;
          url += '&advice=yes';
          url += '&points=yes';

          var defered = $q.defer();
          $http.get(url).success(function (data) {
            if (data.status.apiCode === skobblerApiCodes.sourceSameAsDestination) {
              data.route = {
                duration: 0
              };
            }

            $rootScope.$broadcast(MapsEvents.routeDurationChanged, data.route ? data.route.duration : 0, profile);
            $rootScope.$broadcast(MapsEvents.routeDistanceChanged, data.route ? data.route.routelength : 0, profile);
            defered.resolve(data);
          }).error(function (data, status, headers, config) {
            defered.reject({
              data: data,
              status: status,
              header: headers,
              config: config
            });
          });

          return defered.promise;
        });
      }

    };

    return service;
  }
]);
