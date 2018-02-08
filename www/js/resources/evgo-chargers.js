'use strict';
var angular = require('angular');
require('../services/utils.js');

module.exports = angular.module('app').factory('Evgo', [
  '$resource',
  '$utils',
  function Resource($resource, $utils) {
    return $resource(null, null, $utils.createResource('evgo', {
      chargers: {
        method: 'GET',
        url: $utils.getCustomRoute('evgo/chargers'),
        isArray: true
      }
    }));
  }
]);
