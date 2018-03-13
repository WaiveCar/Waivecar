'use strict';
var angular = require('angular');
require('../services/utils.js');

module.exports = angular.module('app').factory('Chargers', [
  '$resource',
  '$utils',
  function Resource($resource, $utils) {
    return $resource(null, null, $utils.createResource('chargers', {
      list: {
        method: 'GET',
        url: $utils.getCustomRoute('chargers/list'),
        isArray: true
      },
      unlock: {
        method: 'PUT',
        url: $utils.getCustomRoute('chargers/unlock/:id/:charger'),
        params: {
          id: '@carId',
          charger: '@chargerId'
        },
        isArray: false
      }
    }));
  }
]);
