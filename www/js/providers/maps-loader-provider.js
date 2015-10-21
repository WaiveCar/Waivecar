/* global L: false */
'use strict';
var angular = require('angular');

module.exports = angular.module('app.providers').provider('MapsLoader', [

  function () {
    var apiKey = '8698d318586c58a1f8ca1e88ecfac299';

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
