'use strict';
var angular = require('angular');

module.exports = angular.module('app').factory('Notifications', [
  'Resource',
  '$utils',
  function (Resource, $utils) {
    return Resource('/notify', null, {
      create: {
        method: 'POST',
        isArray: false
      },
      refreshDeviceToken: {
        method: 'POST',
        url: $utils.getCustomRoute('refresh-device-token'),
        params: {
          deviceToken: '@deviceToken'
        }
      },
    });
  }
]);
