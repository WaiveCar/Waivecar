angular.module('app.modules.mapping.controllers').controller('RouteDurationController', [
  '$scope',
  '$mapRoute',
  function($scope, $mapRoute) {
    'use strict';

    //TODO: move consts to a const svc
    var ROUTE_DURATION_CHANGED_EVENT = 'waiveCarRouteDurationChanged';
    var ROUTE_DISTANCE_CHANGED_EVENT = 'waiveCarRouteDistanceChanged';

    $scope.$on(ROUTE_DISTANCE_CHANGED_EVENT, function(e, totalDistance) {
      $scope.value = totalDistance + ' m';
    });
  }
]);
