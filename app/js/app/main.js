'use strict';

angular.module('app.admin.controllers', []);
angular.module('app.admin.directives', []);
angular.module('app.admin.filters', []);
angular.module('app.admin.providers', []);
angular.module('app.admin.services', []);

window.app = window.app || {};
window.app.admin = angular.module('app.admin', [
  'ngAnimate',
  'ngSanitize',
  'ui.router',
  'chart.js',
  'yaru22.jsonHuman',
  'ngBootbox',
  'mgcrea.ngStrap',
  'btford.socket-io',
  'angularFileUpload',
  //'app.modules.templates',
  'app.modules.common',
  'app.modules.logging',
  'app.modules.authentication',
  'app.modules.alert',
  'app.admin.controllers',
  'app.admin.directives',
  'app.admin.filters',
  'app.admin.providers',
  'app.admin.services'
]);

window.app.admin.config([
  '$stateProvider',
  '$locationProvider',
  '$httpProvider',
  '$urlRouterProvider',
  function($stateProvider, $locationProvider, $httpProvider, $urlRouterProvider) {

    $stateProvider
      .state('dashboard', {
        url: '/',
        templateUrl: '/templates/dashboard/index.html',
        data: {
          auth: {
            permissions: [ 'can-access-admin' ]
          }
        }
      })
      .state('style-guide', {
        url: '/style-guide',
        templateUrl: '/templates/style-guide/index.html',
        data: {
          auth: {
            permissions: [ 'can-access-admin' ]
          }
        }
      })
      .state('settings', {
        url: '/settings',
        templateUrl: '/templates/table/index.html',
        data: {
          auth: {
            permissions: [ 'can-access-admin' ]
          }
        }
      })
      .state('blacklisted-emails', {
        url: '/users/blacklisted-emails',
        templateUrl: '/templates/table/index.html',
        data: {
          auth: {
            permissions: [ 'can-access-admin' ]
          }
        }
      })
      .state('users', {
        url: '/users',
        templateUrl: '/templates/table/index.html',
        data: {
          auth: {
            permissions: [ 'can-access-admin' ]
          }
        }
      })
      .state('media', {
        url: '/media',
        templateUrl: '/templates/table/index.html',
        data: {
          auth: {
            permissions: [ 'can-access-admin' ]
          }
        },
      })
      .state('roles', {
        url: '/roles',
        templateUrl: '/templates/table/index.html',
        data: {
          auth: {
            permissions: [ 'can-access-admin' ]
          }
        }
      })
      .state('signup', {
        url: '/contact',
        templateUrl: '/templates/auth/signup.html',
        data: {
          auth: {
            permissions: []
          }
        }
      })
      .state('signin', {
        url: '/signin',
        templateUrl: '/templates/auth/signin.html',
        data: {
          auth: {
            app: 'admin',
            redirectIfAuthenticated: true,
            redirectTo: 'dashboard'
          }
        }
      })
      .state('reset-password', {
        url: '/reset-password/:emailToken/:resetToken',
        templateUrl: '/templates/auth/reset.html',
        data: {
          auth: {
            permissions: []
          }
        }
      })
      .state('forgot-password', {
        url: '/forgot-password',
        templateUrl: '/templates/auth/forgot.html',
        data: {
          auth: {
            permissions: []
          }
        }
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: '/templates/auth/forbidden.html',
        data: {
          auth: {
            permissions: []
          }
        }
      });

    $locationProvider.html5Mode({
      enabled: false,
      requireBase: false
    }).hashPrefix('!');

    $urlRouterProvider.when('', '/'); //IE9 fix
  }
]);
