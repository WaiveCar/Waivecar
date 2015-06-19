angular.module('app.modules.mapping.services').service('$mapRoute', [
  '$rootScope',
  '$q',
  'mappingLoader',
  function ($rootScope, $q, mappingLoader) {
    'use strict';

    var svc = {
      getRoute: function(pointA, pointB) {
        return mappingLoader.getMap.then(function(maps) {
          var request = {
            origin: pointA,//new maps.LatLng(40.76,-74.16),
            destination: pointB,//new maps.LatLng(40.76,-73.4),
            travelMode: maps.TravelMode.WALKING
          };

          var directionService = new maps.DirectionsService();
          var defered = self.$q.defer();

          directionService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              var totalTime = 0;
              var totalDistance = 0;
              //Calculate the distance
              result.routes[0].legs.forEach(function(leg) {
                totalTime += leg.duration.value; // in seconds
                totalDistance += leg.distance.value; //Depends on routes option in meter usualy but can be on Imperial
              });

              $rootScope.$broadcast(ROUTE_DURATION_CHANGED_EVENT, totalTime);
              $rootScope.$broadcast(ROUTE_DISTANCE_CHANGED_EVENT, totalDistance);
              defered.resolve(result);
            }
          });

          return defered.promise;
        });
      }
    };

    return svc;
  }
]);
