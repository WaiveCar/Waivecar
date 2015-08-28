function Resource($resource, $utils) {
  return $resource(null, null, $utils.createResource('cars'));
}

angular.module('app').factory('Cars', [
  '$resource',
  '$utils',
  Resource
]);