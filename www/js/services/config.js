angular.module('app.services').factory('$config', [
  function () {
    'use strict';

    return {
      uri: {
        api: 'http://192.168.28.132:8081',
        auth: {
          signin: 'http://192.168.28.132:8081/auth/signin',
          signup: 'http://192.168.28.132:8081/auth/signup',
          forgot: 'http://192.168.28.132:8081/auth/forgot-password',
          reset: 'http://192.168.28.132:8081/auth/reset-password'
        },
        web: 'http://192.168.28.132',
        admin: 'http://192.168.28.132',
        assets: ''
      },
      satellizer: {
        facebook: {
          clientId: '783941098370564',
          url: 'http://192.168.28.132:8081/auth/facebook'
        }
      }
    };
  }
]);