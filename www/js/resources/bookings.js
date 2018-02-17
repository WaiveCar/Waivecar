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
        url: $utils.getCustomRoute('bookings?type=mine&limit=1&order=created_at,DESC&status=ended,started'),
        isArray: true
      },
      query: {
        method: 'GET',
        url: $utils.getCustomRoute('bookings?type=mine&order=created_at,DESC&details=true'),
        isArray: true
      },
      completedCount: {
        method: 'GET',
        url: $utils.getCustomRoute('bookingsCount?status=ended,completed,closed'),
      },
      reservationsCount: {
        method: 'GET',
        url: $utils.getCustomRoute('bookingsCount'),
      },
      extend: {
        method: 'PUT',
        url: $utils.getCustomRoute('bookings/:id/extend'),
        params: {
          id: '@id'
        }
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
      },
      getPastRides: {
        method: 'GET',
        url: $utils.getCustomRoute('bookings?userId=:userId&order=id,DESC&details=true&status=ended,completed,closed&offset=:offset&limit=:limit'),
        isArray: true,
        params: {
          userId: '@userId',
          offset: '@offset',
          limit: '@limit'
        }
      },
      checkParity: {
        method: 'PUT',
        url: $utils.getCustomRoute('bookings/:id/checkParity'),
        params: {
          id: '@id'
        }
      },
      getEndBookingActions: {
        method: 'GET',
        url: $utils.getCustomRoute('actions/current/endBooking/:userId'),
        params: {
          userId: '@userId'
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
