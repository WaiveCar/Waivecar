angular.module('app.services').factory('AuthInterceptor', [
  '$rootScope',
  '$q',
  '$session',
  '$config',
  function ($rootScope, $q, $session, $config) {
    'use strict';

    return {

      request: function (httpConfig) {
        var token = $session.get('auth').token;

        var isLoginRequest = httpConfig.url === $config.uri.auth.login;

        if (token && !isLoginRequest) {
          httpConfig.headers.Authorization = token;
        }

        if (/\/1\//.test(httpConfig.url)) {
          httpConfig.headers['x-referer'] = document.location.origin + '/' + $rootScope.$state.href($rootScope.$state.current);
        }

        return httpConfig;
      },

      httpConfigError: function (rejection) {
        if (401 === rejection.status || 403 === rejection.status) {
          $rootScope.$emit('authError');
        }

        return $q.reject(rejection);
      }

    };
  }
]);
