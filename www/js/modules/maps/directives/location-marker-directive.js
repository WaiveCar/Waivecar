'use strict';
var angular = require('angular');

module.exports = angular.module('Maps').directive('locationMarker', [
  function() {

    function link($scope, $element, $attrs, MapCtrl) {

      function setMarker() {

        if ($scope.marker) {
          $scope.marker.setLatLng([$scope.location.latitude, $scope.location.longitude]);
          MapCtrl.fitBounds();
          return false;
        }

        var icon = MapCtrl.getIconInstance($scope.icon);
        $scope.marker = MapCtrl.addMarker([$scope.location.latitude, $scope.location.longitude], {
          icon: icon
        });

      }

      function init() {

        $scope.$watch('location', function(newValue) {
          if (!newValue) {
            return false;
          }
          setMarker();
        }, true);

        if ($scope.location) {
          setMarker();
        }

      }

      $scope.$on('map-ready', init);

    };

    return {
      restrict: 'E',
      require: '^map',
      scope: {
        location: '=',
        icon: '@'
      },
      link: link
    };

  }
]);
