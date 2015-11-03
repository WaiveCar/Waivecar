'use strict';
var angular = require('angular');
require('../../../providers/maps-loader-provider');

module.exports = angular.module('Maps').directive('map', [
  'MapsLoader',
  '$timeout',
  '$rootScope',
  function(MapsLoader, $timeout, $rootScope) {
    // MapsLoader is an angular provider which returns leaflet instance from 'getMap' call

    var currentLocation = [$rootScope.currentLocation.latitude, $rootScope.currentLocation.longitude];

    return {
      restrict: 'CE',
      templateUrl: '/templates/map.html',
      transclude: true,
      controller: 'MapController',
      scope: {
        zoom: '@',
        center: '='
      },
      compile: function compile() {
        return {
          // preLink ensures that map directive will be linked before any child directives
          // This is needed because child directives rely on mapInstance being set already
          pre: function preLink($scope, $element, $attrs, MapCtrl) {
            console.log('Firing map directive');
            var center = $scope.center ? [$scope.center.latitude, $scope.center.longitude] : currentLocation;

            MapsLoader.getMap.then(function(leaflet) {

              var mapOptions = {
                center: center,
                apiKey: leaflet.skobbler.apiKey,
                zoom: parseInt($scope.zoom, 10),
                tap: true,
                trackResize: false,
                dragging: true
              };

              MapCtrl.mapInstance = leaflet.skobbler.map($element[0].firstChild, mapOptions);
              console.log('MapCtrl.mapInstance', MapCtrl.mapInstance, mapOptions);

              $scope.$watch('center', function() {
                if (!$scope.center || !$scope.center.latitude) {
                  return false;
                }

                $timeout(function(){
                  console.log('setView', $scope.center.latitude, $scope.center.longitude);
                  MapCtrl.mapInstance.setView([$scope.center.latitude, $scope.center.longitude]);
                }, 1000);
              }, true);

            });
          }

        };

      }
    };

  }
]);
