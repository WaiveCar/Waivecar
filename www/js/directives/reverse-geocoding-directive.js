'use strict';
var angular = require('angular');
require('../services/geocoding-service');

module.exports = angular.module('app.directives').directive('reverseGeoCoding', [
  '$geocoding',
  function ($geocoding) {

    function link($scope) {

      $scope.$watch('location', function(newVal){
        var latLng = newVal;
        if (!latLng) {
          return;
        }

        $geocoding.getReverseGeoCoding(latLng.latitude, latLng.longitude).then(function (locationData) {
          if (locationData.address) {
            $scope.address = locationData.address.road;
            if (locationData.address.house_number) {
              $scope.address = locationData.address.house_number + ' ' + $scope.address;
            }
          }
        });

      });

    }

    return {
      restrict: 'E',
      link: link,
      replace: true,
      template: '<div ng-bind="address"></div>',
      scope: {
        location: '='
      }
    };

  }
]);
