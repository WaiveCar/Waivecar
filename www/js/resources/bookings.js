'use strict';
var angular = require('angular');
require('../services/utils.js');

module.exports = angular.module('app').factory('Bookings', [
  '$resource',
  '$utils',
  function ($resource, $utils) {

    var resource = $resource(null, null, $utils.createResource('bookings', {
      current: {
        method: 'GET',
        url: $utils.getCustomRoute('bookings?limit=1&order=created_at,DESC&status=ended,started'),
        isArray: true
      },
      query: {
        method: 'GET',
        url: $utils.getCustomRoute('bookings?order=created_at,DESC'),
        isArray: true
      },
      ready: {
        method: 'PUT',
        url: $utils.getCustomRoute('bookings/:id/ready'),
        params: {
          id: '@id'
        }
      },
      end: {
        method: 'PUT',
        url: $utils.getCustomRoute('bookings/:id/end'),
        params: {
          id: '@id'
        }
      },
      complete: {
        method: 'PUT',
        url: $utils.getCustomRoute('bookings/:id/complete'),
        params: {
          id: '@id'
        }
      }
    }));

    // resource.prototype.$save = function () {
    //   if (!this.id) {
    //     return this.$create();
    //   } else {
    //     return this.$update();
    //   }
    // };

    return resource;

  }
]);
