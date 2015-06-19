angular.module('app.controllers', []);
angular.module('app.directives', []);
angular.module('app.filters', []);
angular.module('app.providers', []);
angular.module('app.services', []);

angular.module('app', [
  'ionic',
  'ngCordova',
  'mgcrea.ngStrap',
  'btford.socket-io',
  'yaru22.jsonHuman',
  'app.modules.alert',
  'app.modules.authentication',
  'app.modules.logging',
  'app.modules.mapping',
  'app.controllers',
  'app.directives',
  'app.filters',
  'app.providers',
  'app.services'
])
.run([
  '$ionicPlatform',
  '$http',
  '$config',
  function($ionicPlatform, $http, $config) {
    'use strict';

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
    'use strict';

    $stateProvider
      .state('intro', {
        url: '/welcome',
        templateUrl: 'templates/intro.html',
        data: {
          auth: {
          }
        }
      })
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
      })
      .state('app.users-new', {
        url: '/register',
        views: {
          'menuContent': {
            templateUrl: 'templates/users/new.html'
          }
        },
        data: {
          auth: {
          }
        }
      })
      .state('app.vehicles', {
        url: '/vehicles',
        views: {
          'menuContent': {
            templateUrl: 'templates/vehicles/index.html'
          }
        },
        data: {
          auth: {
          }
        }
      })
      .state('app.vehicles-show', {
        url: '/vehicles/:id',
        views: {
          'menuContent': {
            templateUrl: 'templates/vehicles/show.html'
          }
        },
        data: {
          auth: {
          }
        }
      })
      .state('app.vehicles-edit', {
        url: '/vehicles/:id/edit',
        views: {
          'menuContent': {
            templateUrl: 'templates/vehicles/edit.html'
          }
        },
        data: {
          auth: {
          }
        }
      })
      .state('app.bookings-new', {
        url: '/vehicles/:id/book',
        views: {
          'menuContent': {
            templateUrl: 'templates/bookings/new.html'
          }
        },
        data: {
          auth: {
          }
        }
      })
      .state('app.bookings-edit', {
        url: '/bookings/:id',
        views: {
          'menuContent': {
            templateUrl: 'templates/bookings/edit.html'
          }
        },
        data: {
          auth: {
            role: 'user'
          }
        }
      })
      .state('app.bookings-show', {
        url: '/bookings/:id',
        views: {
          'menuContent': {
            templateUrl: 'templates/bookings/show.html'
          }
        },
        data: {
          auth: {
            role: 'user'
          }
        }
      })
      .state('app.users-show', {
        url: '/my-account',
        views: {
          'menuContent': {
            templateUrl: 'templates/users/show.html'
          }
        },
        data: {
          auth: {
            role: 'admin'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/welcome');
  }
]);
