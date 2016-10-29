'use strict';
var angular = require('angular');
require('ngCordova');
require('./auth-service.js');

module.exports = angular.module('app.services').factory('PermissionService', [
  '$window',
  '$q',
  function ($window, $q) {
    var permissions = $window.cordova.plugins.permissions;

    function checkPermissionCallback(what) {
      var beforeRequest = new Date();

      var errorCallback = function() {
        var delay = new Date() - beforeRequest; 
        if (delay < 350) {
          // This implies that the user has rejected us always.
        }
        console.warn( what + ' permission is not turned on (' + delay + ')');
        $q.reject();
      };
   
      permissions.requestPermission(
        permissions[what],
        function(status) {
          if(status.hasPermission) {
            console.warn( what + ' permission is turned on');
            $q.resolve();
          }
          errorCallback();
        },
        errorCallback);
    }

    return {
      getPermissionsIfNeeded: function (what) {
        permissions.hasPermission(
          permissions[what], 
          function(status) {
            if(status.hasPermission) {
              console.log( what + ' has permission');
              $q.resolve();
            }
            checkPermissionCallback(what);
          }, 
          null);
      }
    };
  }
]);
