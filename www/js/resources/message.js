'use strict';
var angular = require('angular');

module.exports = angular.module('app').factory('Messages', [
  'Resource',
  function (Resource) {
    return Resource('/contact', null, {
      create: {
        method: 'POST',
        isArray: false
      }
    });
  }
]);
