function Resource($resource, $utils) {
  return $resource(null, null, $utils.createResource('locations'));
}

angular.module('app').factory('Locations', [
  '$resource',
  '$utils',
  Resource
]);