'use strict';

angular.module('app.controllers', []);
angular.module('app.directives', []);
angular.module('app.filters', []);
angular.module('app.providers', []);
angular.module('app.services', []);

angular.module('app', [
  'ionic',
  'app.controllers',
  'app.services',
  'mgcrea.ngStrap',
  'app.modules.alert',
  'app.modules.authentication'
])

.run([
  '$ionicPlatform',
  '$http',
  '$config',
  function($ionicPlatform, $http, $config) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  }
])

.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('intro', {
        url: '/welcome',
        templateUrl: 'templates/intro.html'
      })
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html'
      })
      .state('app.users-new', {
        url: '/register',
        views: {
          'menuContent': {
            templateUrl: 'templates/users/new.html'
          }
        }
      })
      .state('app.users-show', {
        url: '/my-account',
        views: {
          'menuContent': {
            templateUrl: 'templates/users/show.html'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/welcome');
  }
]);
