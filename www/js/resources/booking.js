// REST /cars:id

'use strict';
var angular = require('angular');
require('../services/resource-service');

module.exports = angular.module('app').factory('Booking', [
  'Resource',
  function(Resource) {

    return Resource('/bookings/:id', {
      id: '@id'
    }, {
      create: {
        method: 'POST',
        isArray: false,
      },
      update: {
        method: 'PUT',
        isArray: false,
      }
    });

  }
]);
