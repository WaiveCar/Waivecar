'use strict';
var angular = require('angular');
require('../services/utils.js');

module.exports = angular.module('app').factory('Parking', [
  '$resource',
  '$utils',
  function ($resource, $utils) {
    var resource = $resource(null, null, $utils.createResource('parking', {
      findByLocation : {
        // This fetches a parking spot by its location id.
        method: 'GET',
        url: $utils.getCustomRoute('parking/locations/:locationId'),
        params: {
          locationId: '@locationId'
        }
      },
      fetchReservation : {
        // This is for getting current reservations when the dashboard component is mounted.
        method: 'GET',
        url: $utils.getCustomRoute('parking/fetchReservation/:userId'),
        params: {
          userId: '@userId'
        }
      },
      reserve : {
        // This is for reserving parking spaces. It requires a corresponding userId in the body of 
        // the request.
        method: 'POST',
        url: $utils.getCustomRoute('parking/:id/reserve'),
        params: {
          id: '@id'
        }
      },
      occupy: {
        // This is for moving a car into a space when it is reserved. It requires bot a carId
        // and a reservationId in the body of the request.
        method: 'PUT',
        url: $utils.getCustomRoute('parking/:id/occupy'),
        params: {
          id: '@id'
        }
      },
      cancel : {
        // This cancels a parking reservation. It requires a reservationId in the body of the request.
        method: 'PUT',
        url: $utils.getCustomRoute('parking/:id/cancel'),
        params: {
          id: '@id'
        }
      }
    }));
    return resource;
  }
]);
