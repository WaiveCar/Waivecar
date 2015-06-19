angular.module('app.services').factory('$config', [
  function () {
    'use strict';

    return {
      uri: {
        api: 'http://localhost:3000/v1',
        auth: {
          signin: 'http://localhost:3000/auth/signin',
          signup: 'http://localhost:3000/auth/signup',
          forgot: 'http://localhost:3000/auth/forgot-password',
          reset: 'http://localhost:3000/auth/reset-password'
        },
        web: 'http://localhost',
        admin: 'http://localhost',
        assets: ''
      },
      satellizer: {
        facebook: {
          clientId: '783941098370564',
          url: 'http://localhost:3000/auth/facebook'
        }
      },
      models: {
        users: {
          "singular": "user",
          "plural": "users",
          "route": "/users",
        },
        bookings: {
          "singular": "booking",
          "plural": "bookings",
          "route": "/bookings",
        },
        vehicles: {
          "singular": "vehicle",
          "plural": "vehicles",
          "route": "/vehicles",
        }
      }
    };
  }
]);