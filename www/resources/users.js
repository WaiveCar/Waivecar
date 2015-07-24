function Resource($resource, Utils) {

  function getRoute(hasId) {
    return Utils.getRoute('users', hasId);
  }

  return $resource(null, null, {

    login: {
      method: 'POST',
      url: Utils.getCustomRoute('auth/login')
    },

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

    me: {
      method: 'GET',
      url: Utils.getCustomRoute('users/me')
    }

  });
}

angular.module('app').factory('Users', [
  '$resource',
  'Utils',
  Resource
]);