angular.module('app.directives').directive('mappedCars', [
  'MapsLoader',
  'locationService',
  'mapsEvents',
  function (MapsLoader, locationService, mapsEvents) {

    function addMarkerClick(marker, id, onClickFn) {
      marker.on('mousedown', function(e) {
        onClickFn({ marker: marker, id: id });
      });
    }

    function link($scope, element, attrs, ctrl) {
      $scope.$watch('cars', function(newValue, oldValue) {
        if (!newValue || newValue === oldValue) {
          return;
        }

        MapsLoader.getMap.then(function(lib) {
          ctrl.mapInstance.then(function(mapInstance) {
            var location     = locationService.getLocation();
            var waiveCarIcon = lib.icon({
              iconUrl       : '/img/active-waivecar.svg',
              iconRetinaUrl : '/img/active-waivecar.svg',
              iconSize      : [20, 25],
              iconAnchor    : [10, 25],
              popupAnchor   : [0 , 0]
            });

            if ($scope.group) {
              mapInstance.removeLayer($scope.group);
              $scope.markers.forEach(function(marker){
                mapInstance.removeLayer(marker);
              });
            }

            var markers = [];
            $scope.cars.forEach(function(car) {
              var marker = lib.marker([ car.location.latitude, car.location.longitude ], { icon: waiveCarIcon }).addTo(mapInstance);
              addMarkerClick(marker, car.id, $scope.onClickMarker);
              markers.push(marker);
            });

            if (markers.length > 0) {
              var group = new lib.featureGroup(markers);
              // self.mapInstance.fitBounds(group.getBounds().pad(0.5))
              $scope.group   = group;
              $scope.markers = markers;
            }
          });
        });
      }, true);
    }
    return {
      restrict: 'E',
      link: link,
      require: '^map',
      scope: {
        cars: '=',
        onClickMarker: '&'
      }
    }
  }
]);
