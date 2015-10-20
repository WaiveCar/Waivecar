/* global window: false */
'use strict';
var angular = require('angular');
// var sprintf = require('sprintf').sprintf;
var ionic = require('ionic');
var when = require('when');

module.exports = angular.module('app.services').factory('FaceBookService', [
  '$q',
  '$settings',
  'ezfb',
  function ($q, $settings, ezfb) {

    var isWebView = ionic.Platform.isWebView();
    var fcb = window.facebookConnectPlugin;

    return {
      api: function (graphPath, permissions) {
        if(isWebView){
          return when.promise(function(resolve, reject){
            return fcb.api(graphPath, permissions, resolve, reject);
            // return fcb.api(graphPath, permissions, function(response){
            //   resolve(response);
            // }, function(response){
            //   reject(response);
            // });
          });
        }
        return ezfb.api(graphPath);


      },

      // getAccessToken: function (){},

      getLoginStatus: function () {
        if(isWebView){
          return when.promise(function(resolve, reject){
            return fcb.getLoginStatus(resolve, reject);
            // return fcb.getLoginStatus(function(response){
            //   resolve(response);
            // }, function(response){
            //   reject(response);
            // });
          });
        }

        return ezfb.getLoginStatus();

      },

      // logEvent: function (name, params, valueToSum) {},

      login: function (permissions) {
        if(isWebView){
          return when.promise(function(resolve, reject){
            return fcb.login([permissions], resolve, reject);
            // return fcb.login([permissions], function(response){
            //   resolve(response);
            // }, function(response){
            //   reject(response);
            // });
          });
        }
        return ezfb.login(null, {scope: permissions});

      },

      // logout: function () {},
      // showDialog: function (options) {}

    };

    // function getFacebookCode(clientId, appScope, options) {
    //   var deferred = $q.defer();
    //   var redirectURI = (options && options.redirect_uri) || 'http://localhost';
    //   var responseType = 'code';
    //   var flowUrl = sprintf('https://www.facebook.com/dialog/oauth?client_id=%s&redirect_uri=%s&response_type=%s', clientId, redirectURI, responseType);

    //   if (appScope) {
    //     flowUrl += sprintf('&scope=%s', appScope.join(','));
    //   }
    //   if (options && options.auth_type) {
    //     flowUrl += sprintf('&auth_type=%s', options.auth_type);
    //   }

    //   var browserRef = window.open(flowUrl, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

    //   browserRef.addEventListener('loadstart', function (event) {
    //     if ((event.url).indexOf(redirectURI) !== 0) {
    //       return deferred.reject('The sign in flow broke');
    //     }

    //     browserRef.removeEventListener('exit', angular.noop);
    //     browserRef.close();

    //     var codeIndex = (event.url).indexOf('?code=');
    //     if (codeIndex >= 0) {
    //       return deferred.resolve(event.url.substring(codeIndex + 6));
    //     }

    //     if ((event.url).indexOf('error_code=100') !== 0) {
    //       return deferred.reject('Facebook returned error_code=100: Invalid permissions');
    //     }

    //     deferred.reject('Problem authenticating');

    //   });

    //   browserRef.addEventListener('exit', function () {
    //     deferred.reject('The sign in flow was canceled');
    //   });

    //   return deferred.promise;

    // }

    // function getFacebookInfo() {
    //   return getFacebookCode($settings.facebook.clientId);

    // }

    // return {
    //   getFacebookInfo: getFacebookInfo,
    //   getFacebookCode: getFacebookCode
    // };

  }
]);
