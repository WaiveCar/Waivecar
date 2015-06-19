angular.module('app.modules.mapping.directives').directive('nearbyFleet', [
  '$q',
  'mappingLoader',
  '$fleet',
  function ($q, mappingLoader, $fleet) {
    'use strict';

    function link(scope, element, attrs,ctrl) {
      $fleet.getNearbyFleet().then(function(fleet) {
        mappingLoader.getMap.then(function(gMaps) {
          ctrl.mapInstance.then(function(mapInstance) {

            function addListener(marker){
              gMaps.event.addListener(marker, 'click', function() {
                mapInstance.panTo(marker.getPosition());
              });
            }

            var latLng;
            var markers = [];

            fleet.forEach(function(f) {
              latLng = new gMaps.LatLng(f.latitude, f.longitude);
              var marker = new gMaps.Marker({
                position: latLng,
                map: mapInstance,
              });

              markers.push(marker);
              addListener(marker);
            });

            ctrl.solveDestiny(markers[0]);
          });
        });
      });
    }

    return {
      restrict:'CE',
      link: link,
      require:'^map'
    }

  }
]);
