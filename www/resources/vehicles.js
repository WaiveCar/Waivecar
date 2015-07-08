function Resource($resource, utils, config) {

  function getRoute(hasId) {
    return utils.getRoute('vehicles', hasId);
  }

  return $resource(null, null, {

    save: {
      method: 'POST',
      url: getRoute()
    },

    query: {
      method: 'GET',
      url: getRoute(),
      isArray: true,
      transformResponse: utils.transformArrayResponse
    },

    get: {
      method: 'GET',
      url: getRoute(true)
    },

    update: {
      method: 'PUT',
      url: getRoute(true),
      params: {
        id: '@id'
      }
    }

  });
}

angular.module('app').factory('Vehicles', [
  '$resource',
  'utils',
  'config',
  Resource
]);