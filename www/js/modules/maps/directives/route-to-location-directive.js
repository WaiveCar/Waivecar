'use strict';
var angular = require('angular');
require('../../../providers/maps-loader-provider');
var _ = require('lodash');

module.exports = angular.module('Maps').directive('routeToLocation', [
  '$rootScope',
  'RouteService',
  '$log',
  function ($rootScope, RouteService, $log) {

    // function drawRoute(Leaflet, startLocation, destinyLocation, map, $scope) {

      // drawRoute(Leaflet, $scope.start, $scope.destiny, MapCtrl.map, $scope);

    function drawRoute(MapCtrl, $scope) {
      if (!$scope.start || !$scope.destiny) {
        return false;
      }

      return RouteService.getRoute($scope.start, $scope.destiny)
        .then(function (result) {
          if (_.isUndefined(result.route) || _.isUndefined(result.route.routePoints)) {
            $log.error('Unable to resolve route from point A to point B');
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
            MapCtrl.removeRoute($scope.route);
            MapCtrl.map.removeLayer($scope.route);
          }

          $scope.route = MapCtrl.addRoute(lines);

          // var unlockRangeOptions = {
          //   strokeOpacity: 0.0,
          //   fillOpacity: 0.0,
          //   strokeWeight: 0
          // };

          // var radius = 25;

          // map.fitBounds($scope.route.getBounds());
          // if (startLocation.distanceTo(deviceLocation)<=25) {
          //   $rootScope.$broadcast(MapsEvents.withinUnlockRadius);
          // }

        });

    }

    function link($scope, $element, $attrs, MapCtrl) {

      function handleMove() {
        if ($scope.start && $scope.destiny) {
          drawRoute(MapCtrl, $scope);
        }
      }

      function init(){
        $scope.$watch('start', handleMove, true);
        $scope.$watch('destiny', handleMove, true);
      }

      $scope.$on('map-ready', init);

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
