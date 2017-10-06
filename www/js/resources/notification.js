'use strict';
var angular = require('angular');

module.exports = angular.module('app').factory('Notifications', [
  'Resource',
  function (Resource) {
    return Resource('/notify', null, {
      create: {
        method: 'POST',
        isArray: false
      },
      refreshDeviceToken: {
        method: 'PUT',
        url: $utils.getCustomRoute('refreshDeviceToken'),
        params: {
          id: '@id'
        }
      },
    });
  }
]);
