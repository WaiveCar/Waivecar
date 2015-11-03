'use strict';
var angular = require('angular');
require('../../../providers/maps-loader-provider');
var _ = require('lodash');

module.exports = angular.module('Maps').directive('routeToLocation', [
  '$rootScope',
  'MapsLoader',
  'RouteService',
  function ($rootScope, MapsLoader, RouteService) {

    function drawRoute(Leaflet, startLocation, destinyLocation, mapInstance, $scope) {
      if (!startLocation || !destinyLocation) {
        return false;
      }

      return RouteService.getRoute(startLocation, destinyLocation).then(function (result) {
        if (_.isUndefined(result.route) || _.isUndefined(result.route.routePoints)) {
          return;
        }

        var coordinates = [];
        result.route.routePoints.forEach(function (p) {
          coordinates.push([p.x, p.y]);
        });

        var lines = [{
          type: 'LineString',
          coordinates: coordinates
        }];

        if ($scope.route) {
          mapInstance.removeLayer($scope.route);
        }

        $scope.route = Leaflet.geoJson(lines);
        $scope.route.addTo(mapInstance);

        // var unlockRangeOptions = {
        //   strokeOpacity: 0.0,
        //   fillOpacity: 0.0,
        //   strokeWeight: 0
        // };

        // var radius = 25;

        mapInstance.fitBounds($scope.route.getBounds());
        // if (startLocation.distanceTo(deviceLocation)<=25) {
        //   $rootScope.$broadcast(MapsEvents.withinUnlockRadius);
        // }

      });

    }

    function link($scope, $element, $attrs, MapCtrl) {

      MapsLoader.getMap.then(function (Leaflet) {

        function handleMove() {
          if ($scope.start && $scope.destiny) {
            drawRoute(Leaflet, $scope.start, $scope.destiny, MapCtrl.mapInstance, $scope);
          }
        }
        $scope.$watch('start', handleMove, true);
        $scope.$watch('destiny', handleMove, true);

      });
    }

    return {
      restrict: 'E',
      require: '^map',
      scope: {
        start: '=',
        destiny: '='
      },
      link: link
    };

  }
]);
