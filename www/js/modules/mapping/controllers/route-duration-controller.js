angular.module('app.modules.mapping.controllers').controller('RouteDurationController', [
  '$scope',
  '$mapRoute',
  'EVENTS',
  function($scope, $mapRoute, EVENTS) {
    'use strict';

    $scope.$on(EVENTS.ROUTE_DISTANCE_CHANGED_EVENT, function(e, totalDistance) {
      $scope.value = totalDistance + ' m';
    });
  }
]);
