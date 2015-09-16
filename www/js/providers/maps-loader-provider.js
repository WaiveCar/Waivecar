/* global L: false */
'use strict';
var angular = require('angular');

module.exports = angular.module('app.providers').provider('MapsLoader', [

  function () {
    var apiKey = '7ef929e2c765b1194804e5e8ca284c5a';

    return {
      $get: function ($q) {
        L.skobbler.apiKey = apiKey;
        var deferred = $q.defer();
        deferred.resolve(L);
        return {
          getMap: deferred.promise
        };
      },

      setOption: function () {
        //TBD
      }

    };

  }
]);
