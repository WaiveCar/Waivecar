'use strict';
var angular = require('angular');
require('../../../providers/maps-loader-provider');

module.exports = angular.module('Maps').directive('locateMe', [
  'MapsLoader',
  function (MapsLoader) {
    return {
      restrict: 'E',
      scope: {
        'imgSource': '@',
        'imgOnClick': '&'
      },
      require: '^map',
      link: function ($scope, element, attrs, ctrl) {
        var L;
        MapsLoader.getMap.then(function (mapL) {
          L = mapL;
          return $scope.$parent.mapInstance || $scope.$parent.$parent.mapInstance;
        })
          .then(function (mapInstance) {
            var LocateMeControl = L.Control.extend({
              options: {
                position: 'bottomright'
              },
              onAdd: function (map) {
                var img = L.DomUtil.create('img', 'locate-me');
                img.src = $scope.imgSource;
                L.DomEvent.addListener(img, 'mousedown', L.DomEvent.stopPropagation)
                  .addListener(img, 'mousedown', L.DomEvent.preventDefault)
                  .addListener(img, 'mousedown', function () {
                    $scope.imgOnClick();
                  });

                return img;
              }
            });

            var locateMe = new LocateMeControl();
            mapInstance.addControl(locateMe);
          });
      }
    };

  }
]);
