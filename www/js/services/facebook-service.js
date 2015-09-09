'use strict';
angular.module('app.services').factory('FaceBookService', [
  '$q',
  '$config',
  function ($q, $config) {

    function getFacebookInfo() {
      return getFacebookCode($config.facebook.clientId);

    };

    function getFacebookCode(clientId, appScope, options) {
      var deferred = $q.defer();
      var redirect_uri = (options && options.redirect_uri) || "http://localhost";
      var response_type = "code";
      var flowUrl = "https://www.facebook.com/dialog/oauth?client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&response_type=code";

      if (appScope) {
        flowUrl += "&scope=" + appScope.join(",");
      }
      if (options && options.auth_type) {
        flowUrl += "&auth_type=" + options.auth_type;
      }

      var browserRef = window.open(flowUrl, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

      browserRef.addEventListener('loadstart', function (event) {
        if ((event.url).indexOf(redirect_uri) !== 0) {
          return deferred.reject("The sign in flow broke");
        }

        browserRef.removeEventListener("exit", function (event) {});
        browserRef.close();

        var codeIndex = (event.url).indexOf("?code=");
        if (codeIndex >= 0) {
          return deferred.resolve(event.url.substring(codeIndex + 6));
        }

        if ((event.url).indexOf("error_code=100") !== 0) {
          return deferred.reject("Facebook returned error_code=100: Invalid permissions");
        }

        deferred.reject("Problem authenticating");

      });

      browserRef.addEventListener('exit', function (event) {
        deferred.reject("The sign in flow was canceled");
      });

      return deferred.promise;

    };

    return {
      getFacebookInfo: getFacebookInfo,
      getFacebookCode: getFacebookCode
    };

  }
]);
