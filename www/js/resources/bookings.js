function Resource($resource, $utils) {
  return $resource(null, null, $utils.createResource('bookings'));
}

angular.module('app').factory('Bookings', [
  '$resource',
  '$utils',
  Resource
]);