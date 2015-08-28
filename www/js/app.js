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
  // 'WaiveCar.state.rules',
  // 'WaiveCar.state',
  // 'config',
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
        templateUrl : '/templates/auth/index.html'
      })
      .state('auth-login', {
        cache       : false,
        url         : '/auth/login',
        templateUrl : '/templates/auth/login.html'
      })
      .state('auth-forgot-password', {
        cache       : false,
        url         : '/auth/forgot-password',
        templateUrl : '/templates/auth/forgot-password.html'
      })
      .state('auth-reset-password', {
        cache       : false,
        url         : '/auth/reset-password',
        templateUrl : '/templates/auth/reset-password.html'
      })
      /* BOOKINGS */
      .state('bookings', {
        url         : '/bookings',
        templateUrl : '/templates/bookings/index.html'
      })
      .state('bookings-new', {
        url         : '/bookings/new',
        templateUrl : '/templates/bookings/new.html'
      })
      .state('bookings-show', {
        url         : '/bookings/:id',
        templateUrl : '/templates/bookings/show.html'
      })
      .state('bookings-edit', {
        url         : '/bookings/:id/edit',
        templateUrl : '/templates/bookings/edit.html'
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
      /* USERS */
      .state('users-new', {
        url         : '/users/new',
        templateUrl : '/templates/users/new.html'
      })
      .state('users-show', {
        url         : '/users/:id',
        templateUrl : '/templates/users/show.html'
      })
      .state('users-edit', {
        url         : '/users/:id/edit',
        templateUrl : '/templates/users/edit.html'
      })
      /* LICENSES */
      .state('licenses-new', {
        url         : '/licenses/new',
        templateUrl : '/templates/licenses/new.html'
      })
      .state('licenses-show', {
        url         : '/licenses/:id',
        templateUrl : '/templates/licenses/show.html'
      })
      .state('licenses-edit', {
        url         : '/licenses/:id/edit',
        templateUrl : '/templates/licenses/edit.html'
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
