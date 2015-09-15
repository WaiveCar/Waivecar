angular.module('app.services').factory('FaceBookService', [
  '$q',
  '$config',
  function ($q, $config) {
    'use strict';

    function getFacebookCode(clientId, appScope, options) {
      var deferred = $q.defer();
      var redirectURI = (options && options.redirect_uri) || 'http://localhost';
      var responseType = 'code';
      var flowUrl = sprintf('https://www.facebook.com/dialog/oauth?client_id=%s&redirect_uri=%s&response_type=%s', clientId, redirectURI, responseType);

      if (appScope) {
        flowUrl += sprintf('&scope=%s', appScope.join(','));
      }
      if (options && options.auth_type) {
        flowUrl += sprintf('&auth_type=%s', options.auth_type);
      }

      var browserRef = window.open(flowUrl, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

      browserRef.addEventListener('loadstart', function (event) {
        if ((event.url).indexOf(redirectURI) !== 0) {
          return deferred.reject('The sign in flow broke');
        }

        browserRef.removeEventListener('exit', angular.noop);
        browserRef.close();

        var codeIndex = (event.url).indexOf('?code=');
        if (codeIndex >= 0) {
          return deferred.resolve(event.url.substring(codeIndex + 6));
        }

        if ((event.url).indexOf('error_code=100') !== 0) {
          return deferred.reject('Facebook returned error_code=100: Invalid permissions');
        }

        deferred.reject('Problem authenticating');

      });

      browserRef.addEventListener('exit', function () {
        deferred.reject('The sign in flow was canceled');
      });

      return deferred.promise;

    }

    function getFacebookInfo() {
      return getFacebookCode($config.facebook.clientId);

    }

    return {
      getFacebookInfo: getFacebookInfo,
      getFacebookCode: getFacebookCode
    };

  }
]);
