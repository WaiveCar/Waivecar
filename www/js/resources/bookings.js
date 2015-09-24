'use strict';
var angular = require('angular');
require('../services/utils.js');

module.exports = angular.module('app').factory('Bookings', [
  '$resource',
  '$utils',
  function ($resource, $utils) {
    return $resource(null, null, $utils.createResource('bookings'));
  }
]);
