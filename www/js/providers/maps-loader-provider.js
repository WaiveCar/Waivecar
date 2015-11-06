/* global L: true */
'use strict';
var angular = require('angular');

module.exports = angular.module('app.providers').provider('MapsLoader', [

  function() {
    var apiKey;

    this.setApiKey = function(key) {
      apiKey = key;
    };

    this.$get = function($q) {
      if (!apiKey) {
        throw 'Map api key not defined!';
      }

      if(!L){
        throw 'Leaflet plugin not initialized!';
      }

      L.skobbler.apiKey = apiKey;
      var deferred = $q.defer();
      deferred.resolve(L);

      return {
        getMap: deferred.promise,
        leaflet: L
      };

    };

  }
]);
