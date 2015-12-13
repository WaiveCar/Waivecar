'use strict';
var angular = require('angular');
require('../services/utils.js');

module.exports = angular.module('app').factory('Cars', [
  '$resource',
  '$utils',
  function Resource($resource, $utils) {
    return $resource(null, null, $utils.createResource('cars', {
      lock: {
        method: 'PUT',
        url: $utils.getCustomRoute('cars/:id/lock'),
        params: {
          id: '@id'
        }
      }
    }));
  }
]);
