'use strict';
var angular = require('angular');

module.exports = angular.module('app').factory('Reports', [
  'Resource',
  function (Resource) {
    return Resource('/reports', null, {
      create: {
        method: 'POST',
        isArray: false
      }
    });
  }
]);
