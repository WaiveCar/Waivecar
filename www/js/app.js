'use strict';

angular.module('app.controllers', []);
angular.module('app.directives', []);
angular.module('app.filters', []);
angular.module('app.providers', []);
angular.module('app.services', []);

window.app = angular.module('app', [
  'ionic',
  'ngResource',
  'ngFitText',
  'ui.router',
  'btford.socket-io',
  'app.controllers',
  'app.directives',
  'app.filters',
  'app.providers',
  'app.services',
  'config',
  'Maps',
  'Maps.realReach',
  'Maps.route',
  'Maps.geoCoding',
  // 'countdown',
  // 'ads',
  'mockBehaviours'
  // 'ChargingStations',
  // 'PointsOfInterest',
  // 'layout',
  // 'Camera',
  // 'social'
]);

window.app.config([
  '$ionicConfigProvider',
  '$stateProvider',
  '$locationProvider',
  '$httpProvider',
  '$urlRouterProvider',
  '$compileProvider',
  function($ionicConfigProvider, $stateProvider, $locationProvider, $httpProvider, $urlRouterProvider, $compileProvider) {

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

    $httpProvider.interceptors.push('AuthInterceptor');

    $ionicConfigProvider.views.transition('platform');

    $stateProvider
      /* DEFAULT */
      .state('landing', {
        cache       : false,
        url         : '/',
        templateUrl : '/templates/landing/index.html'
      })
      /* AUTH */
      .state('auth', {
        url         : '/auth',
        templateUrl : '/templates/auth/index.html',
        data        : {
          auth : false
        }
      })
      .state('auth-login', {
        cache       : false,
        url         : '/auth/login',
        templateUrl : '/templates/auth/login.html',
        data        : {
          auth : false
        }
      })
      .state('auth-forgot-password', {
        cache       : false,
        url         : '/auth/forgot-password',
        templateUrl : '/templates/auth/forgot-password.html',
        data        : {
          auth : false
        }
      })
      .state('auth-reset-password', {
        cache       : false,
        url         : '/auth/reset-password',
        templateUrl : '/templates/auth/reset-password.html',
        data        : {
          auth : false
        }
      })
      /* BOOKINGS */
      .state('bookings', {
        url         : '/bookings',
        templateUrl : '/templates/bookings/index.html',
        data        : {
          auth : true
        }
      })
      .state('bookings-new', {
        url         : '/bookings/new',
        templateUrl : '/templates/bookings/new.html',
        data        : {
          auth : true
        }
      })
      .state('bookings-show', {
        url         : '/bookings/:id',
        templateUrl : '/templates/bookings/show.html',
        data        : {
          auth : true
        }
      })
      .state('bookings-edit', {
        url         : '/bookings/:id/edit',
        templateUrl : '/templates/bookings/edit.html',
        data        : {
          auth : true
        }
      })
      /* CARS */
      .state('cars', {
        url         : '/cars',
        templateUrl : '/templates/cars/index.html'
      })
      .state('cars-show', {
        url         : '/cars/:id',
        templateUrl : '/templates/cars/show.html'
      })
      .state('messages-new', {
        url         : '/messages/new',
        templateUrl : '/templates/messages/new.html'
      })
      /* CREDIT CARDS */
      .state('credit-cards', {
        url         : '/credit-cards',
        templateUrl : '/templates/credit-cards/index.html',
        data        : {
          auth : true
        }
      })
      .state('credit-cards-new', {
        url         : '/credit-cards/new',
        templateUrl : '/templates/credit-cards/new.html',
        data        : {
          auth : true
        }
      })
      /* USERS */
      .state('users-new', {
        url         : '/users/new',
        templateUrl : '/templates/users/new.html',
        data        : {
          auth : false
        }
      })
      .state('users-show', {
        url         : '/users/:id',
        templateUrl : '/templates/users/show.html',
        data        : {
          auth : true
        }
      })
      .state('users-edit', {
        url         : '/users/:id/edit',
        templateUrl : '/templates/users/edit.html',
        data        : {
          auth : true
        }
      })
      /* LICENSES */
      .state('licenses-new', {
        url         : '/licenses/new',
        templateUrl : '/templates/licenses/new.html',
        data        : {
          auth : true
        }
      })
      .state('licenses-show', {
        url         : '/licenses/:id',
        templateUrl : '/templates/licenses/show.html',
        data        : {
          auth : true
        }
      })
      .state('licenses-edit', {
        url         : '/licenses/:id/edit',
        templateUrl : '/templates/licenses/edit.html',
        data        : {
          auth : true
        }
      })
      .state('vision', {
        url         : '/vision',
        templateUrl : '/templates/vision/index.html',
        data        : {
          auth : true
        }
      })
      .state('ads', {
        url         : '/ads',
        templateUrl : '/templates/ads/index.html',
        params : {
          redirectUrl    : null,
          redirectParams : null
        }
      })
      .state('errors-show', {
        url         : '/errors/:id',
        templateUrl : '/templates/errors/show.html'
      });

    $urlRouterProvider.otherwise('/');

  }
]);

window.app.run([
  '$ionicPlatform',
  '$rootScope',
  function Run($ionicPlatform, $rootScope) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }

      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  }
]);
