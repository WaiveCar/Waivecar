
'use strict';
var angular = require('angular');
require('../services/resource-service');

module.exports = angular.module('app').factory('Verification', [
  'Resource',
  function(Resource) {

    return Resource('/verifications/:action', {}, {
      verify: {
        method: 'PUT',
        params: {
          action: '@token'
        }
      },
      sendEmail: {
        method: 'POST',
        params: {
          action: 'email-verification'
        }
      },
      sendSMS: {
        method: 'POST',
        params: {
          action: 'phone-verification'
        }
      }
    });

  }
]);
