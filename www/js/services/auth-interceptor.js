'use strict';
var angular = require('angular');
require('./session-service.js');
var _ = require('lodash');

module.exports = angular.module('app.services').factory('AuthInterceptor', [
  '$rootScope',
  '$q',
  '$session',
  '$settings',
  '$document',
  function ($rootScope, $q, $session, $settings, $document) {

    return {

      request: function (httpConfig) {
        var auth = $session.get('auth') || {};
        var token = auth.token;

        var isLoginRequest = httpConfig.url === $settings.uri.auth.login;
        var isSkobblerRequest = httpConfig.url.indexOf($settings.skobbler.key) !== -1;

        if (token && !isLoginRequest && !isSkobblerRequest) {
          httpConfig.headers.Authorization = token;
        }

        // if (/\/1\//.test(httpConfig.url)) {
        //   httpConfig.headers['x-referer'] = $document.location.origin + '/' + $rootScope.$state.href($rootScope.$state.current);
        // }

        return httpConfig;
      },

      responseError: function (rejection) {
        if (_.contains([401, 403], rejection.status)) {
          $rootScope.$emit('authError');
        }

        return $q.reject(rejection);

      }

    };
  }
]);
