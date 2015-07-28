function Resource($resource, $utils) {

  function getRoute(hasId) {
    return $utils.getRoute('users', hasId);
  }

  return $resource(null, null, $utils.createResource('users', {
    login  : {
      method : 'POST',
      url    : $utils.getCustomRoute('auth/login')
    },
    logout : {
      method : 'POST',
      url    : $utils.getCustomRoute('auth/logout')
    },
    me     : {
      method : 'GET',
      url    : $utils.getCustomRoute('users/me')
    }
  }));
}

angular.module('app').factory('Users', [
  '$resource',
  '$utils',
  Resource
]);