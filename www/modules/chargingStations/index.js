function nearbyChargingStationsDirective(MapsLoader, $q){
	 function addMarkerClick(marker, info, onClickFn) {
    marker.on('mousedown', function(e) {
      onClickFn({ marker: marker, info: info });
    });
  }

  function link(scope, element, attrs, ctrl) {

    scope.$watch('locations', function() {
      if (!scope.locations || (_.isArray(scope.locations) && scope.locations.length === 0)) return;

      MapsLoader.getMap.then(function(L) {

        var stationIcon = L.icon({
          iconUrl       : 'img/charging-station.svg',
          iconRetinaUrl : 'img/charging-station.svg',
          iconSize      : [ 20, 25 ],
          iconAnchor    : [ 10, 25 ],
          popupAnchor   : [ 0 , 0 ]
        });

        ctrl.mapInstance.then(function(mapInstance) {

          if (scope.group) {
            console.log('locations: removing locations from map instance');
            mapInstance.removeLayer(scope.group);
            scope.markers.forEach(function(marker) {
              self.mapInstance.removeLayer(marker);
            });
          }

          scope.markers = [];
          console.log('locations: adding locations to map instance');
          scope.locations.forEach(function(location) {
            // TODO: filter out on stations (if we add addtional location types).
            var marker = L.marker([ location.latitude, location.longitude ], { icon: stationIcon }).addTo(mapInstance);
            addMarkerClick(marker, location, scope.onClickMarker);
            scope.markers.push(marker);
          });

          if (scope.markers.length > 0) {
            scope.group = new L.featureGroup(scope.markers);
          }
        });
      });
    }, true);
  }

  return {
    restrict : 'E',
    link     : link,
    require  : '^map',
    scope    : {
      locations     : '=',
      onClickMarker : '&'
    }
  }
}

angular.module('ChargingStations', []).directive('nearbyChargingStations', [
  'MapsLoader',
  '$q',
  nearbyChargingStationsDirective
]);
