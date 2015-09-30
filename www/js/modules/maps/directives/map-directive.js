'use strict';
var angular = require('angular');
require('../../../providers/maps-loader-provider');

module.exports = angular.module('Maps').directive('map', [
  'MapsLoader',
  function (MapsLoader) {

    function link($scope, element) {
      MapsLoader.getMap.then(function (maps) {

        var mapOptions = {
          center: [10, 10],
          apiKey: maps.skobbler.apiKey,
          zoom: parseInt($scope.zoom, 10),
          tap: true,
          trackResize: false
        };

        var mapInstance = maps.skobbler.map(element[0].firstChild, mapOptions);
        $scope.$watch('center', function () {
          if (!$scope.center || !$scope.center.latitude) {
            return false;
          }

          mapInstance.setView([$scope.center.latitude, $scope.center.longitude]);
          $scope.solveMap(mapInstance);
        }, true);

      });

    }

    return {
      restrict: 'CE',
      templateUrl: '/js/modules/maps/templates/map.html',
      link: link,
      transclude: true,
      controller: 'MapController',
      scope: {
        zoom: '@',
        center: '='
      }
    };

  }
]);
