'use strict';

// POST /verifications/:type will send a verification request of the assigned type.
// PUT /verifications/:token will attempt to verify the provided token.
// GET /verifications/:token will return a token payload if exists.

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
