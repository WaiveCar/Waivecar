'use strict';
var angular = require('angular');
require('../services/utils.js');

module.exports = angular.module('app').factory('Locations', [
  '$resource',
  '$utils',
  function Resource($resource, $utils) {
    return $resource(null, null, $utils.createResource('locations', {
      dropoff: {
        method: 'GET',
        url: $utils.getCustomRoute('locations')
        isArray: true
      }
    });
  }
]);
