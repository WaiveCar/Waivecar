angular.module('app.modules.mapping.directives').directive('mapInfo', [
  'mappingLoader',
  function(mappingLoader) {
    'use strict';

    function link(scope, element, attrs, ctrl) {
      mappingLoader.getMap.then(function(gMaps) {
        var div = element[0].firstChild;
        //We have to style manually
        ctrl.mapInstance.then(function(mapInstance){
          mapInstance.controls[gMaps.ControlPosition.TOP_RIGHT].push(div);
        });
      });
    }
    return {
      restrict:'E',
      require:'^map',
      templateUrl:'templates/gMapsInfoContainer.html',
      link:link
    }
  }
]);
