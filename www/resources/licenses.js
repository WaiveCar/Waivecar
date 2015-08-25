function Resource($resource, $utils) {
  return $resource(null, null, $utils.createResource('licenses'));
}

angular.module('app').factory('Licenses', [
  '$resource',
  '$utils',
  Resource
]);