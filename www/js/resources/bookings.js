'use strict';
var angular = require('angular');
require('../services/utils.js');
var _ = require('lodash');

module.exports = angular.module('app').factory('Bookings', [
  '$resource',
  '$utils',
  function ($resource, $utils) {

    var resource = $resource(null, null, $utils.createResource('bookings', {
      ready: {
        method: 'PUT',
        url: $utils.getCustomRoute('bookings/:id/ready'),
        params: {
          id: '@id'
        }
      },
      start: {
        method: 'PUT',
        url: $utils.getCustomRoute('bookings/:id/start'),
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
