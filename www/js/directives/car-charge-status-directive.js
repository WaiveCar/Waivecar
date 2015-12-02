'use strict';
var angular = require('angular');

module.exports = angular.module('app.directives')
  .directive('carChargeStatus', [

    function carChargeStatusDirective() {

      function link ($scope) {

        function setInfo(car){
          if(!car){
            return;
          }
          car.fuel = car.fuel || 0;
          car.range = car.range || 0;

          $scope.chargeLevel = car.fuel + '%';
          $scope.chargeState = car.charging ? 'Parked at charging station' : 'Not charging';
          $scope.chargeReach = car.range + ' miles ';

        }

        $scope.$watch('car', setInfo);

      }

      return {
        restrict: 'E',
        link: link,
        templateUrl: 'templates/directives/car-charge-status.html',
        scope: {
          car: '='
        }
      };

    }

  ]);
