'use strict';
var angular = require('angular');

module.exports = angular.module('Maps').directive('routeDistance', [
  'mapsEvents',
  function(mapsEvents) {

    function metersToMiles(meters) {
      var digits = 3;
      var str = meters * 0.00062137 + '';
      return str.substring(0, str.indexOf('.') + digits);
    }

    function link(scope) {
      scope.$on(mapsEvents.routeDistanceChanged, function(ev, totalDistance) {
        console.log('mapsEvents.routeDistanceChanged fired');
        scope.value = metersToMiles(totalDistance) + ' miles away';
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
