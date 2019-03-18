'use strict';
var angular = require('angular');
require('./session-service.js');
var _ = require('lodash');

module.exports = angular.module('app.services').factory('AuthInterceptor', [
  '$rootScope',
  '$q',
  '$session',
  '$settings',
  /* '$document', */
  function ($rootScope, $q, $session, $settings/* , $document */) {

    return {

      request: function (httpConfig) {
        var auth = $session.get('auth') || {};
        var token = auth.token;

        var isLoginRequest = httpConfig.url === $settings.uri.auth.login;
        var isOpenMapRequest = /openstreetmap/.test(httpConfig.url);

        if (token && !isLoginRequest && !isOpenMapRequest) {
          httpConfig.headers.Authorization = token;
        }

        // TODO: what was this for?
        // if (/\/1\//.test(httpConfig.url)) {
        //   httpConfig.headers['x-referer'] = $document.location.origin + '/' + $rootScope.$state.href($rootScope.$state.current);
        // }

        return httpConfig;
      },

      responseError: function (rejection) {
        if (_.contains([401, 403], rejection.status) && !/openstreetmap/.test(rejection.config.url)) {
          $rootScope.$emit('authError');
        }

        return $q.reject(rejection);

      }

    };
  }
]);
