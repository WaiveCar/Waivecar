'use strict';
var angular = require('angular');
require('../../../providers/maps-loader-provider');

module.exports = angular.module('Maps').directive('locationMarkers', [
  'MapsLoader',
  function (MapsLoader) {
    return {
      restrict: 'E',
      require: '^map',
      scope: {
        locations: '=',
        icon: '@',
        onClickMarker: '&'
      },
      link: function ($scope, $element, $attrs, MapCtrl) {

        function addMarkerClick(marker, id, onClickFn) {
          marker.on('mousedown', function () {
            onClickFn({
              id: id
            });
          });
        }

        function getIcon() {
          switch ($scope.icon) {
          case 'car':
            {
              return {
                iconUrl: 'img/active-waivecar.svg',
                iconRetinaUrl: 'img/active-waivecar.svg',
                iconSize: [20, 25],
                iconAnchor: [10, 25],
                popupAnchor: [0, 0]
              };
            }
          default:
            {
              return {
                iconUrl: 'img/charging-station.svg',
                iconRetinaUrl: 'img/charging-station.svg',
                iconSize: [20, 25],
                iconAnchor: [10, 25],
                popupAnchor: [0, 0]
              };
            }
          }
        }

        function setMarkers() {
          MapsLoader.getMap.then(function (L) {

            var mapInstance = MapCtrl.mapInstance;
            var icon = L.icon(getIcon());

            if ($scope.group) {
              mapInstance.removeLayer($scope.group);
              $scope.markers.forEach(function (marker) {
                mapInstance.removeLayer(marker);
              });
            }

            var markers = [];
            $scope.locations.forEach(function (location) {
              var lat = location.latitude || location.location.latitude;
              var long = location.longitude || location.location.longitude;
              var marker = L.marker([lat, long], {
                icon: icon
              }).addTo(mapInstance);
              addMarkerClick(marker, location.id, $scope.onClickMarker);
              markers.push(marker);
            });

            if (markers.length > 0) {
              var group = new L.featureGroup(markers);
              // self.mapInstance.fitBounds(group.getBounds().pad(0.5))
              $scope.group = group;
              $scope.markers = markers;
            }

          });

        }

        $scope.$watch('locations', function (newValue, oldValue) {
          if (!newValue || newValue === oldValue) {
            return false;
          }
          setMarkers();
        }, true);

        if ($scope.locations) {
          setMarkers();
        }

      }

    };

  }
]);
