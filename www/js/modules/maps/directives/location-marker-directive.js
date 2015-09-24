'use strict';
var angular = require('angular');
require('../../../providers/maps-loader-provider');

module.exports = angular.module('Maps').directive('locationMarker', [
  'MapsLoader',
  function (MapsLoader) {
    return {
      restrict: 'E',
      require: '^map',
      scope: {
        location: '=',
        icon: '@'
      },
      link: function ($scope, element, attrs, ctrl) {

        function getIcon() {
          switch ($scope.icon) {
          case 'car':
            {
              return {
                iconUrl: '/img/active-waivecar.svg',
                iconRetinaUrl: '/img/active-waivecar.svg',
                iconSize: [20, 25],
                iconAnchor: [10, 25],
                popupAnchor: [0, 0]
              };
            }
          default:
            {
              return {
                iconUrl: '/img/user-location.svg',
                iconRetinaUrl: '/img/user-location.svg',
                iconSize: [25, 25],
                iconAnchor: [12.5, 25],
                popupAnchor: [0, 0]
              };
            }
          }
        }

        function setMarker() {
          MapsLoader.getMap.then(function (L) {
            // TODO: figure out how to access mapInstance properly. (e.g. transclude?)
            var parentMapInstance = $scope.$parent.mapInstance || $scope.$parent.$parent.mapInstance;
            parentMapInstance.then(function (mapInstance) {
              if ($scope.marker) {
                $scope.marker.setLatLng([$scope.location.latitude, $scope.location.longitude]);
              } else {
                var icon = L.icon(getIcon());
                $scope.marker = L.marker([$scope.location.latitude, $scope.location.longitude], {
                  icon: icon
                }).addTo(mapInstance);
              }
            });
          });
        }

        $scope.$watch('location', function (newValue, oldValue) {
          if (!newValue || newValue === oldValue) {
            return false;
          }
          setMarker();
        }, true);

        if ($scope.location) {
          setMarker();
        }
      }

    };

  }
]);
