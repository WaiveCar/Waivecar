
'use strict';
var angular = require('angular');
require('../services/resource-service');

module.exports = angular.module('app').factory('Verification', [
  'Resource',
  function(Resource) {

    return Resource('/verification', {}, {
      verify: {
        method: 'PUT'
      }
    });

  }
]);
