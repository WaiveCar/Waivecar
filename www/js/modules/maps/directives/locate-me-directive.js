'use strict';
var angular = require('angular');
require('../../../providers/maps-loader-provider');

module.exports = angular.module('Maps').directive('locateMe', [
  'MapsLoader',
  'LocationService',
  '$rootScope',
  function (MapsLoader, LocationService, $rootScope) {
    return {
      restrict: 'E',
      scope: {
        'imgSource': '@',
      },
      require: '^map',
      link: function ($scope, $element, $attrs, MapCtrl) {

        function locateMeOnMap() {
          LocationService.getLocation().then(function(deviceLocation) {
            $rootScope.currentLocation = deviceLocation;
          });

        };

        MapsLoader.getMap.then(function (Leaflet) {

          var LocateMeControl = Leaflet.Control.extend({
            options: {
              position: 'bottomright'
            },
            onAdd: function () {
              var img = Leaflet.DomUtil.create('img', 'locate-me');
              img.src = $scope.imgSource;

              Leaflet.DomEvent.addListener(img, 'mousedown', Leaflet.DomEvent.stopPropagation)
                .addListener(img, 'mousedown', Leaflet.DomEvent.preventDefault)
                .addListener(img, 'mousedown', function () {
                  locateMeOnMap();
                });

              return img;
            }
          });

          var locateMeControl = new LocateMeControl();
          MapCtrl.mapInstance.addControl(locateMeControl);

        });

      }
    };

  }
]);
