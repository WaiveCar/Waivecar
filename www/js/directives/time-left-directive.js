'use strict';
var angular = require('angular');

module.exports = angular.module('app.directives').directive('timeLeft', [

  function () {

    function link(scope, element, attrs, ctrl) {
      var durations = scope.getDuration();

      ctrl.createTimer(scope.timerName, durations);

      ctrl.start();

      var watchExpressions = [

        function () {
          return ctrl.seconds;
        },
        function () {
          return ctrl.minutes;
        },
        function () {
          return ctrl.seconds;
        }
      ];

      scope.$watchGroup(watchExpressions, function (newValues, oldValues, scope) {
        if (ctrl.hours > 0) {
          scope.timeLeftDisplay = ctrl.hours + ':' + ctrl.minutes + ' hours left';

        } else if (ctrl.minutes > 0) {
          scope.timeLeftDisplay = ctrl.minutes + ':' + ctrl.seconds + ' minutes left';

        } else if (ctrl.seconds > 0) {
          scope.timeLeftDisplay = ctrl.seconds + ' seconds left';

        } else {
          scope.timeLeftDisplay = 'no time left';

        }

      });

    }

    return {
      restrict: 'E',
      templateUrl: 'templates/directives/time-left.html',
      link: link,
      controller: 'TimerController',
      controllerAs: 'timer',
      scope: {
        getDuration: '&',
        timerName: '@',
        foo: '@'
      }
    };

  }
]);
