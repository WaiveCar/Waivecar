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
            return fcb.login(permissions, resolve, reject);
          });
        }
        return ezfb.login(null, {scope: permissions.toString()});

      },

      // logout: function () {},
      // showDialog: function (options) {}

    };

  }
]);
