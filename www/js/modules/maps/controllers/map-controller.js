'use strict';
var angular = require('angular');

module.exports = angular.module('Maps').controller('MapController', [
  '$scope',
  '$q',
  function ($scope, $q) {

    var deferedMap = $q.defer();

    $scope.mapInstance = deferedMap.promise;

    $scope.solveMap = function (mapInstance) {
      deferedMap.resolve(mapInstance);
    };

  }
]);
