angular.module('app.modules.mapping.controllers').controller('RouteTimeController', [
  '$scope',
  '$mapRoute',
  function($scope, $mapRoute) {
    'use strict';

    //TODO: move consts to a const svc
    var ROUTE_DURATION_CHANGED_EVENT = 'waiveCarRouteDurationChanged';
    var ROUTE_DISTANCE_CHANGED_EVENT = 'waiveCarRouteDistanceChanged';

    $scope.$on(ROUTE_DURATION_CHANGED_EVENT, function(ev,totalTime) {
      var timeToDisplay;
      var timeInHours;
      var timeInMinutes=Math.floor(totalTime/60);
      if (timeInMinutes <= 0) {
        timeToDisplay='< 1m';
      } else if (timeInMinutes > 60) {
        var timeInHours = Math.floor(timeInMinutes / 60);
        timeInMinutes= timeInMinutes - timeInHours * 60;
        if (timeInMinutes < 10) {
          timeInMinutes = '0' + timeInMinutes;
        }

        timeToDisplay= timeInHours + ':' + timeInMinutes;
      } else {
        if (timeInMinutes < 10) {
          timeInMinutes = '0' + timeInMinutes;
        }

        timeToDisplay = '00h' + timeInMinutes;
      }

      $scope.value = timeToDisplay;
    });

  }
]);
