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
      controller: function() {
        var ctrl = this;
        ctrl.toggle = toggle;

        function toggle() {
          ctrl.val = !ctrl.val;
        }
      }
    };
  });
