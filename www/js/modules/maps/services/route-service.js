/* global google */
'use strict';
var angular = require('angular');
require('../../../providers/maps-loader-provider');

module.exports = angular.module('Maps').service('RouteService', [
  '$rootScope',
  '$q',
  'MapsEvents',
  function ($rootScope, $q, MapsEvents) {

    var googleDirectionsService = new google.maps.DirectionsService();
    var service = {

      getGRoute: function (start, destiny, callback) {

        var request = {
          origin: start,
          destination: destiny,
          travelMode: google.maps.TravelMode.WALKING
        };

        googleDirectionsService.route(request, function (response, status) {
          if (status === google.maps.DirectionsStatus.OK) {

            $rootScope.$broadcast(MapsEvents.routeDurationChanged, response.routes[0].legs[0].duration.value, 'pedestrian');
            $rootScope.$broadcast(MapsEvents.routeDistanceChanged, response.routes[0].legs[0].distance.value, 'pedestrian');

            callback(response, status);
          }
        });
      }
    };

    return service;
  }
]);
