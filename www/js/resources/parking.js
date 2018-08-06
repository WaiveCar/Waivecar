'use strict';
var angular = require('angular');
require('../services/utils.js');

module.exports = angular.module('app').factory('Parking', [
  '$resource',
  '$utils',
  function ($resource, $utils) {
    var resource = $resource(null, null, $utils.createResource('parking', {
      findByLocation : {
        method: 'GET',
        url: $utils.getCustomRoute('parking/locations/:locationId'),
        params: {
          locationId: '@locationId'
        }
      },

      reserve : {
        method: 'POST',
        url: $utils.getCustomRoute('parking/:id/reserve'),
        params: {
          id: '@id'
        }
      }
    }));
    return resource;
  }
]);
