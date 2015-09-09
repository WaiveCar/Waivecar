angular.module('Maps').controller('MapController', [
  '$scope',
  '$q',
  function($scope, $q, MapsEvents) {

    var deferedMap = $q.defer();

    $scope.mapInstance = deferedMap.promise;

    $scope.solveMap = function(mapInstance) {
      deferedMap.resolve(mapInstance);
    };

  }
]);
