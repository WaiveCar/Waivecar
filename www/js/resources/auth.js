// Route.pst('/auth/login', {
//   uses   : 'AuthController@login',
//   params : [ 'identifier', 'password' ]
// });

// Route.pst('/auth/facebook',                  'AuthController@facebook');
// Route.get('/auth/remember', ['authenticate', 'AuthController@remember']);
// Route.get('/auth/validate', ['authenticate', 'AuthController@validate']);
// Route.get('/auth/logout',   ['authenticate', 'AuthController@logout']);

'use strict';
var angular = require('angular');
require('../services/resource-service');

module.exports = angular.module('app').factory('Auth', [
  'Resource',
  function(Resource) {

    return Resource('/auth/:action', {}, {
      login: {
        method: 'POST',
        isArray: false,
        params: {
          action: 'login'
        }
      },
      facebook: {
        method: 'POST',
        isArray: false,
        params: {
          action: 'facebook'
        }
      },
      remember: {
        method: 'GET',
        isArray: false,
        params: {
          action: 'remember'
        }
      },
      validate: {
        method: 'GET',
        isArray: false,
        params: {
          action: 'validate'
        }
      },
      logout: {
        method: 'GET',
        isArray: false,
        params: {
          action: 'logout'
        }
      }
    });

  }
]);
