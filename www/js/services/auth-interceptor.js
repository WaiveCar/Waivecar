angular.module('app.services').factory('AuthInterceptor', [
  '$rootScope',
  '$q',
  '$session',
  function ($rootScope, $q, $session) {
    return {

      request: function (response) {
        var token = $session.get('auth').token;

        if (undefined !== token) {
          response.headers['Authorization'] = token;
        }

        if (/\/1\//.test(response.url)) {
          response.headers['x-referer'] = document.location.origin + '/' + $rootScope.$state.href($rootScope.$state.current);
        }

        return response;
      },

      responseError: function (rejection) {
        if (401 === rejection.status || 403 === rejection.status) {
          $rootScope.$emit('authError');
        }

        return $q.reject(rejection);
      }

    };
  }
]);
