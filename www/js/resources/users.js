'use strict';
var angular = require('angular');
require('../services/utils.js');

module.exports = angular.module('app').factory('Users', [
  '$resource',
  '$utils',
  function ($resource, $utils) {

    return $resource(null, null, $utils.createResource('users', {
      login: {
        method: 'POST',
        url: $utils.getCustomRoute('auth/login')
      },
      logout: {
        method: 'POST',
        url: $utils.getCustomRoute('auth/logout')
      },
      me: {
        method: 'GET',
        url: $utils.getCustomRoute('users/me')
      },
      createCustomer: {
        method: 'POST',
        url: $utils.getCustomRoute('payments/customer')
      },
      createCard: {
        method: 'POST',
        url: $utils.getCustomRoute('payments/cards')
      },
      facebook: {
        method: 'POST',
        url: $utils.getCustomRoute('auth/facebook')
      }
    }));

  }
]);
