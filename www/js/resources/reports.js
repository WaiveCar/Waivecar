'use strict';
var angular = require('angular');

module.exports = angular.module('app').factory('Reports', [
  'Resource',
  '$utils',
  function (Resource, $utils) {
    return Resource('/reports', null, {
      create: {
        method: 'POST',
        isArray: false
      },
      carReports: {
        url: $utils.getCustomRoute('reports/car/:id'),
        params: {
          id: '@id'
        },
        method: 'GET',
        isArray: true
      }
    });
  }
]);
