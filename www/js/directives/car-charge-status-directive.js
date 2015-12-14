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
          car.charge = car.charge || 0;
          car.range = car.range || 0;

          $scope.chargeLevel = car.charge + '%';
          $scope.chargeState = car.isCharging ? 'is Parked at Charging Station' : 'is not charging';
          $scope.chargeReach = car.range + ' miles ';
          $scope.license = car.license;

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
