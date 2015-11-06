'use strict';
var angular = require('angular');

module.exports = angular.module('Maps').directive('locationMarkers', [

  function() {

    function setMarkers(MapCtrl, $scope) {

      $scope.locations.forEach(function(location) {

        var icon = MapCtrl.getIconInstance($scope.icon);
        var lat = location.latitude || location.location.latitude;
        var long = location.longitude || location.location.longitude;

        $scope.marker = MapCtrl.addMarker([lat, long], {icon: icon});

        MapCtrl.addMarkerEventHandler($scope.marker, 'mousedown', function(){
          $scope.onClickMarker({id: location.id});
        });

      });

      MapCtrl.fitBounds();

    }


    function link($scope, $element, $attrs, MapCtrl) {

      function init(){

        $scope.$watch('locations', function(newValue, oldValue) {
          if (!newValue || newValue === oldValue) {
            return false;
          }
          setMarkers(MapCtrl, $scope);
        }, true);

        if ($scope.locations) {
          setMarkers(MapCtrl, $scope);
        }

      }

      $scope.$on('map-ready', init);

    }

    return {
      restrict: 'E',
      require: '^map',
      scope: {
        locations: '=',
        icon: '@',
        onClickMarker: '&'
      },
      link: link
    };

  }
]);
