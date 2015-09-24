'use strict';
var angular = require('angular');
require('../services/geocoding-service');

module.exports = angular.module('app.directives').directive('reverseGeoCoding', [
  '$geocoding',
  function ($geocoding) {
    function link($scope, element, attrs, ctrl) {
      var latLng = $scope.getLocation();
      if (!latLng) {
        return;
      }

      $geocoding.getReverseGeoCoding(latLng.latitude, latLng.longitude).then(function (locationData) {
        if (locationData.address) {
          $scope.location = locationData.address.road;
          if (locationData.address.house_number) {
            $scope.location = locationData.address.house_number + ' ' + $scope.location;
          }
        }
      });

    }

    return {
      restrict: 'E',
      link: link,
      template: '<span ng-bind="location"></span>',
      scope: {
        getLocation: '&'
      }
    };

  }
]);
