'use strict';
var angular = require('angular');

module.exports = angular.module('app.directives').directive('goBack', [
  '$ionicHistory',
  function ($ionicHistory) {

    return {
      restrict: 'A',
      scope: {
        steps: '@goBack'
      },
      link: function ($scope, $element) {
        $element.on('click', function () {
          var steps = $scope.steps ? -(parseInt($scope.steps, 10)) : -1;
          $ionicHistory.goBack(steps);
        });
      }
    };

  }

]);
