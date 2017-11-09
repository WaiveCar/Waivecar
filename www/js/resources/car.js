// REST /cars:id

'use strict';
var angular = require('angular');
require('../services/resource-service');

module.exports = angular.module('app').factory('Car', [
  'Resource',
  function(Resource) {

    function transformResponse(data) {
      data = angular.fromJson(data);
      data.location = {
        latitude: data.latitude,
        longitude: data.longitude
      };
      return data;
    }

    return Resource('/cars/:id', {
      id: '@id'
    }, {
      create: {
        method: 'POST',
        isArray: false,
      },
      update: {
        method: 'PUT',
        isArray: false,
      },
      get: {
        method: 'GET',
        isArray: false,
        transformResponse: transformResponse
      }
    });

  }
]);
