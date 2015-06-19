angular.module('app.modules.mapping.directives').directive('map', [
  '$q',
  'mappingLoader',
  '$mapLocation',
  function($q, mappingLoader, $mapLocation) {
    'use strict';

    function link(scope, element, attrs,ctrl) {
      mappingLoader.getMap.then(function(maps) {
        $mapLocation.getLocation().then(function(deviceLocation) {
          var mapOptions = {
            zoom: parseInt(scope.zoom, 10),
            center: new maps.LatLng(deviceLocation.latitude, deviceLocation.longitude)
          };

          var mapInstance = new maps.Map(element[0].firstChild, mapOptions);
          ctrl.solveMap(mapInstance);
        });
      });
    }

    return {
      restrict: 'CE',
      scope: {
        zoom: '@'
      },
      templateUrl: 'templates/map.html',
      link: link,
      transclude: true,
      controller: 'MapController'
    };
  }
]);
