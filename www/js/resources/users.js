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
    },
    createCustomer : {
      method : 'POST',
      url    : $utils.getCustomRoute('payments/customer')
    },
    createCard : {
      method : 'POST',
      url    : $utils.getCustomRoute('payments/cards')
    },
    facebook : {
      method : 'POST',
      url    : $utils.getCustomRoute('auth/facebook')
    }
  }));
}

angular.module('app').factory('Users', [
  '$resource',
  '$utils',
  Resource
]);