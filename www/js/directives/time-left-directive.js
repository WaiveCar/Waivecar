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

      scope.$watchGroup(watchExpressions, function (newValues, oldValues, _scope) {
        if (ctrl.hours > 0) {
          _scope.timeLeftDisplay = ctrl.hours + ' hours ' + ctrl.minutes + ' minutes left';

        } else if (ctrl.minutes > 0) {
          _scope.timeLeftDisplay = ctrl.minutes + ' minutes ' + ctrl.seconds + ' seconds left';

        } else if (ctrl.seconds > 0) {
          _scope.timeLeftDisplay = ctrl.seconds + ' seconds left';

        } else {
          _scope.timeLeftDisplay = 'No time left';

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
