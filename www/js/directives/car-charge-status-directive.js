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
            ratio = 0.7;
          } else {
            ratio = 1.35
          }
           
          Object.assign($scope, car);
          car.charge = car.charge || 0;
          car.range = car.range || 0;

          $scope.chargeLevel = Math.min(car.charge, 100) + '%';
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
