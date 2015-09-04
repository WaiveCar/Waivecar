angular.module('Maps').directive('map', [
  'MapsLoader',
  '$q',
  'MapsEvents',
  function (MapsLoader, $q, MapsEvents) {

    function link($scope, element, attrs, ctrl) {
      MapsLoader.getMap.then(function(maps) {

        var mapOptions = {
          center      : [10, 10],
          apiKey      : maps.skobbler.apiKey,
          zoom        : parseInt($scope.zoom, 10),
          tap         : true,
          trackResize : false
        };

        var mapInstance = maps.skobbler.map(element[0].firstChild, mapOptions);
        $scope.$watch('center', function(newValue, oldValue) {
          if (!$scope.center || !$scope.center.latitude) return;
          mapInstance.setView([ $scope.center.latitude, $scope.center.longitude ]);
          $scope.solveMap(mapInstance);
        }, true);
      });
    }

    return {
      restrict     : 'CE',
      templateUrl  : '/js/modules/maps/templates/map.html',
      link         : link,
      transclude   : true,
      controller   : 'MapController',
      scope        : {
        zoom   : '@',
        center : '='
      }
    };
  }
]);