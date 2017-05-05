'use strict';
var angular = require('angular');

module.exports = angular.module('app.directives')
  .directive('carChargeStatus', [

    function carChargeStatusDirective() {

      var ratio = 0.7;

      function link ($scope) {

        function setInfo(car){
          if(!car){
            return;
          }
          car.charge = car.charge || 0;
          car.range = car.range || 0;

          $scope.chargeLevel = Math.min(car.charge, 100) + '%';
          $scope.chargeState = car.isCharging ? 'is charging' : 'is not charging';
          $scope.chargeReach = (car.range || car.charge * ratio).toFixed(2) + ' miles ';
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
