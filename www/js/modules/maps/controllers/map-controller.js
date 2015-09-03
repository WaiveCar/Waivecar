angular.module('Maps').controller('MapController', [
  '$scope',
  '$q',
  'MapsEvents',
  function($scope, $q, MapsEvents) {

    var deferedMap = $q.defer();
    var deferedLocation = $q.defer();
    var deferedDestiny = $q.defer();

    $scope.mapInstance = deferedMap.promise;
    $scope.locationMarker = deferedLocation.promise;
    $scope.destinyMarker = deferedDestiny.promise;

    $scope.updateTileCount = function(tileCount) {
      $scope.tileCount = tileCount;
    };

    $scope.solveMap = function(mapInstance) {
      deferedMap.resolve(mapInstance);
    };

    $scope.solveDestiny = function(destinyMarker) {
      $scope.destinyMarker = destinyMarker;
      deferedDestiny.resolve(destinyMarker);
    };

    $scope.solveLocation = function(locationMarker) {
      $scope.locationMarker = locationMarker;
      deferedLocation.resolve(locationMarker);
    };

    $scope.$on(MapsEvents.positionChanged, function(ev, position) {
      if (typeof $scope.locationMarker !== 'undefined' && !!$scope.locationMarker) {
        $scope.locationMarker.setLatLng([ position.latitude, position.longitude ]);
      }
    });

    // $scope.$on(MapsEvents.destinyOnRouteChanged, function(ev, position) {
    //   if (typeof $scope.destinyMarker !== 'undefined' && !!$scope.destinyMarker) {
    //     $scope.destinyMarker.setLatLng([ position.latitude, position.longitude ]);
    //   }
    // });
  }
]);
