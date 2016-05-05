'use strict';

var angular = require('angular');

module.exports = angular.module('app.directives')
  .directive('yesNoToggle', function() {
    return {
      scope: {
        val: '='
      },
      templateUrl: 'templates/directives/yes-no-toggle.html',
      bindToController: true,
      controllerAs: 'ctrl',
      replace: true,
      controller: ['$scope', function($scope) {
        var ctrl = this;
        ctrl.toggle = toggle;
        console.log('scope: ', $scope);
        console.log('this: ', this);

        function toggle() {
          ctrl.val = !ctrl.val;
        }
      }]
    };
  });
