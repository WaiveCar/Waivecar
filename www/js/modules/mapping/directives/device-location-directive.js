angular.module('app.modules.mapping.directives').directive('deviceLocation', [
  '$q',
  'mappingLoader',
  '$mapLocation',
  function($q, mappingLoader, $mapLocation) {
    'use strict';

    function link(scope, element, attrs, ctrl) {
      mappingLoader.getMap.then(function(gMaps){
        var image = new google.maps.MarkerImage(
          'http://plebeosaur.us/etc/map/bluedot_retina.png',
          null, // size
          null, // origin
          new google.maps.Point( 8, 8 ), // anchor (move to center of marker)
          new google.maps.Size( 17, 17 ) // scaled size (required for Retina display icon)
        );

        $mapLocation.getLocation().then(function(deviceLocation) {
          ctrl.mapInstance.then(function(mapInstance){
            var latLng = new gMaps.LatLng(deviceLocation.latitude, deviceLocation.longitude);
            scope.marker=new gMaps.Marker({
              map: mapInstance,
              position: latLng,
              title: 'pulsing',
              draggable: true,
              icon: image
            });

            console.log(scope.marker);

            gMaps.event.addListener(scope.marker, 'click', function() {
              mapInstance.setCenter({ lat: deviceLocation.latitude, lng: deviceLocation.longitude });
            });

            mapInstance.setCenter(scope.marker.getPosition());
            ctrl.solveLocation(scope.marker);
          });
        });
      });
    }

    return {
      link: link,
      require: '^map',
      scope: {}
    };
  }
]);
