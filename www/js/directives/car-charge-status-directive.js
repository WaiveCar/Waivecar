'use strict';
var angular = require('angular');

module.exports = angular.module('app.directives')
  .directive('carChargeStatus', [

    function carChargeStatusDirective() {

      function link($scope) {

        function setInfo(car){
          if(!car){
            return;
          }

          var diagnosticsData = {};

          $scope.car.diagnostics.forEach(function(d) {
            diagnosticsData[d.type] = d.value;
          });

          $scope.chargeLevel = diagnosticsData.evBatteryLevel + '%';

          if (diagnosticsData.evChargeState === 'Not Charged') {
            $scope.chargeState = 'Not charging';
          } else {
            $scope.chargeState = 'Parked at charging station';
          }

          $scope.chargeReach = diagnosticsData.totalRange + ' miles ';

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
