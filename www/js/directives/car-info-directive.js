'use strict';
var angular = require('angular');

module.exports = angular.module('app.directives')
  .directive('carInfo', [

    function advertisementDirective() {

      function link($scope) {

        $scope.$watch('car', function(car) {
          car = car || {};
          $scope.make = car.make;
          $scope.model = car.model || 'Spark';
          $scope.plate = car.plate || 'AUD 568';
          $scope.image = car.image || 'img/car.jpg';

        });

      }

      return {
        restrict: 'E',
        link: link,
        transclude: true,
        templateUrl: 'templates/directives/car-info.html',
        scope: {
          car: '='
        }
      };

    }

  ]);
