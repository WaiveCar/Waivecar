'use strict';
var angular = require('angular');

module.exports = angular.module('Maps').directive('locateMe', [
  'MockLocationService',
  function(LocationService) {

    function link($scope, $element, $attrs, MapCtrl) {

      function focusOnMyPosition(event){
        event.preventDefault();
        event.stopPropagation();

        LocationService.getLocation()
          .then(function(loc){
            MapCtrl.map.setView([loc.latitude, loc.longitude]);
          });

      }

      MapCtrl.$ready.then(function () {
        var LocateMeControl = MapCtrl.leaflet.Control.extend({
          options: {
            position: 'bottomright'
          },
          onAdd: function() {
            var img = MapCtrl.leaflet.DomUtil.create('img', 'locate-me');
            img.src = 'img/locate-me.svg';
            img.addEventListener('click', focusOnMyPosition);
            return img;
          }
        });

        MapCtrl.map.addControl(new LocateMeControl());
      });
    }


    return {
      restrict: 'A',
      require: '^skobblerMap',
      link: link
    };

  }
]);
