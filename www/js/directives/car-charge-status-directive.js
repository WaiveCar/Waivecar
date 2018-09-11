'use strict';
var angular = require('angular');

module.exports = angular.module('app.directives')
  .directive('carChargeStatus', [

    function carChargeStatusDirective() {

      function link ($scope) {

        function setInfo(car){
          var ratio;
          if(!car) {
            return;
          } 
          if(car.model === 'Spark EV') {
            ratio = 0.68;
          } else {
            ratio = 1.35;
          }
           
          Object.assign($scope, car);
          car.charge = Math.min(car.charge || 0, 100);
          car.range = car.range || 0;

          $scope.chargeLevel = car.charge + '%';
          $scope.chargeState = car.isCharging ? 'is charging' : 'is not charging';
          $scope.chargeReach = (car.range || car.charge * ratio).toFixed(2) + ' miles ';
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
