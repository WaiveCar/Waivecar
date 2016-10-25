'use strict';
var angular = require('angular');

module.exports = angular.module('Maps').directive('routeDuration', [
  'mapsEvents',
  function routeDurationDirective(mapsEvents) {
    function link(scope) {

      scope.$on(mapsEvents.routeDurationChanged, function(ev, totalTime, profile) {
        var timeInHours = 0;
        var timeToDisplay;
        var timeInMinutes = Math.floor(totalTime / 60);

        if (timeInMinutes <= 0) {
          timeToDisplay = '< 1m';
        } else {
          timeToDisplay = (
            Math.floor(timeInMinutes / 60) + 'hr ' +
            Math.floor(timeInMinutes % 60) + 'min'
          ).replace(/^[0hr ]*/, '');
        }

        scope.value = timeToDisplay;

        if (profile === 'pedestrian') {
          scope.value += ' walking';
        } else {
          scope.value += ' driving';
        }

      });

    }

    return {
      restrict: 'E',
      link: link,
      scope: true,
      template: '<span ng-bind="value"></span>'
    };

  }
]);
