function Resource($resource, Utils) {

  function getRoute(hasId) {
    return Utils.getRoute('locations', hasId);
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
      transformResponse: Utils.transformArrayResponse
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
    },

    delete: {
      method: 'DELETE',
      url: getRoute(true)
    }

  });
}

angular.module('app').factory('Locations', [
  '$resource',
  'Utils',
  Resource
]);