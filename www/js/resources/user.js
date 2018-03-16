// Route.get('/users/me',       ['authenticate', 'UsersController@me']);
// Route.pst('/users/password',                  'UsersController@passwordToken');
// Route.put('/users/password',                  'UsersController@passwordReset');

'use strict';
var angular = require('angular');
var sprintf = require('sprintf-js').sprintf;
require('../services/resource-service');

module.exports = angular.module('app').factory('User', [
  'Resource',
  '$utils',
  '$settings',
  '$location',
  function(Resource, $utils, $settings, $location) {

    var res = Resource('/users/:id/:action', {
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
      initPasswordReset: {
        method: 'POST',
        isArray: false,
        url: $utils.getCustomRoute('reset-password/token'),
        transformRequest: function(data){
          data.resetUrl = sprintf('%(protocol)s://%(host)s%(port)s/reset-password', {
            protocol: $location.protocol(),
            host: $location.host(),
            port: $location.port() ? ':' + $location.port() : ''
          });
          return angular.toJson(data);
        }
      },
      submitNewPassword: {
        method: 'PUT',
        isArray: false,
        url: $utils.getCustomRoute('reset-password')
      },
      verify: {
        method: 'POST',
        params: {
          action: 'verify'
        }
      },
      addToWaitlist: {
        method: 'POST',
        isArray: false,
        url: $utils.getCustomRoute('waitlist/add')
      },
    });

    return res;
  }
]);
