'use strict';
var angular = require('angular');
require('../services/geocoding-service');

module.exports = angular.module('app.directives').directive('reverseGeoCoding', [
  '$geocoding',
  function ($geocoding) {

    function link($scope) {

      var stopWatch = $scope.$watch('location', function(latLng){
        if (!(latLng && latLng.latitude)) {
          return;
        }

        $geocoding(latLng.latitude, latLng.longitude).then(function (locationData) {
          if (locationData.address) {
            $scope.address = locationData.address.road;
            if (locationData.address.house_number) {
              $scope.address = locationData.address.house_number + ' ' + $scope.address;
            }
          }
        });

      });

      $scope.$on('$destroy', function () {
        stopWatch();
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
