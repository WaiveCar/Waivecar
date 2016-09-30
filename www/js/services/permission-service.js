'use strict';
var angular = require('angular');
require('ngCordova');
require('./auth-service.js');

module.exports = angular.module('app.services').factory('PermissionService', [
  '$window',
  function ($window) {

    function checkPermissionCallback(what, promise, permissions) {
      var errorCallback = function() {
        console.warn( what + ' permission is not turned on');
        promise.reject(false);
      };
   
      return permissions.requestPermission(
        permissions[what],
        function(status) {
          if(status.hasPermission) {
            console.warn( what + ' permission is turned on');
            return promise.resolve(true);
          }
          errorCallback();
        },
        errorCallback);
    }

    return {
      getPermissionsIfNeeded: function (what, promise) {
        var permissions = $window.cordova.plugins.permissions;

        return permissions.hasPermission(
          permissions[what], 
          function(status) {
            if(status.hasPermission) {
              promise.resolve(true);
            }
            return checkPermissionCallback(what, promise, permissions);
          }, 
          null);
      }
    };
  }
]);
