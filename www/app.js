
function Run($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}

function Config($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider,$compileProvider) {
  'use strict';
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
  $httpProvider.interceptors.push('AuthInterceptor');
  $ionicConfigProvider.views.transition('platform');
   $stateProvider
    // FIND WAIVECARS
    .state('cars', {
      url: '/cars',
      templateUrl: '/components/cars/templates/fleet.html'
    })
    // SHOW WAIVECAR
    .state('cars-show', {
      url: '/cars/:id',
      templateUrl: '/components/cars/templates/show.html'
    })
    .state('users-new', {
      url         : '/users/new',
      templateUrl : '/components/users/templates/new.html',
      params      : {
        redirectUrl    : null,
        redirectParams : null
      }
    })
    .state('users-show', {
      url: '/users/:id',
      templateUrl: '/components/users/templates/show.html'
    })
    .state('credit-cards', {
      url         : '/users/cards',
      templateUrl : '/components/credit-cards/templates/index.html',
      params      : {
        redirectUrl    : null,
        redirectParams : null
      }
    })
    .state('credit-cards-new', {
      url         : '/users/cards/new',
      templateUrl : '/components/credit-cards/templates/new.html',
      params      : {
        redirectUrl    : null,
        redirectParams : null
      }
    })
    .state('licenses', {
      url         : '/users/licenses',
      templateUrl : '/components/licenses/templates/index.html',
      params      : {
        redirectUrl    : null,
        redirectParams : null
      }
    })
    .state('licenses-new', {
      url         : '/users/licenses/new',
      templateUrl : '/components/licenses/templates/new.html',
      params      : {
        redirectUrl    : null,
        redirectParams : null
      }
    })
    //Connect to car
    .state('cars-connect', {
      url: '/cars/connect/:id',
      templateUrl: '/components/cars/templates/connect.html'
    })
    .state('cars-connecting', {
      url: '/cars/connecting/:id',
      templateUrl: '/components/cars/templates/connecting.html'
    })
    // .state('cars-edit', {
    //   url: '/cars/:id/edit',
    //   templateUrl: '/components/cars/templates/edit.html'
    // })
    // PAST RIDES
    .state('bookings', {
      url: '/bookings',
      templateUrl: '/components/bookings/templates/index.html',
      params      : {
        redirectUrl    : null,
        redirectParams : null
      }
    })
    .state('bookings-new', {
      url: '/bookings/new',
      templateUrl: '/components/bookings/templates/new.html',
      params      : {
        redirectUrl    : null,
        redirectParams : null
      }
    })
    // GET TO YOUR CAR
    .state('bookings-show', {
      url: '/bookings/:id',
      templateUrl: '/components/bookings/templates/show.html',
      params : { vehicleDetails: null}
    })
    .state('bookings-edit', {
      url: '/bookings/:id/edit',
      templateUrl: '/components/bookings/templates/edit.html',
      params : { vehicleDetails: null}
    })
    .state('vision', {
      url: '/vision',
      templateUrl: '/components/vision/templates/index.html'
    })
    .state('contact', {
      url: '/contact',
      templateUrl: '/components/contact/templates/index.html'
    })
    .state('points', {
      url: '/my-points',
      templateUrl: '/components/users/templates/reward-points.html'
    })
    .state('dashboard',{
      url:'/ride/dashboard',
      templateUrl: '/components/ride/templates/dashboard.html'
    })
    .state('summary',{
      url:'/ride/summary',
      templateUrl: '/components/ride/templates/summary.html'
    })
    .state('paid-ride',{
      url:'/paid-ride',
      templateUrl: '/components/ride/templates/paidDashboard.html'
    })
   .state('ride-end',{
      url:'/ride/end',
      templateUrl: '/components/ride/templates/endRide.html'
    })
    .state('ride-end-low-charge',{
      url:'/ride/end/low-charge',
      templateUrl: '/components/ride/templates/endRideLowCharge.html'
    })
    .state('ride-alert-low-battery',{
      url:'/ride/alert/low-battery',
      templateUrl: '/components/ride/templates/lowBatteryAlert.html'
    })
    .state('ride-alert-free-ride',{
        url:'/ride/alert/free-ride',
        templateUrl: '/components/ride/templates/freeRideAlert.html'
    })
    //All purposes ads
    .state('ads',{
      url:'/ads',
      templateUrl: '/components/ads/templates/index.html',
      params:{redirectUrl:null,redirectParams:null}
    })
    //Errors
    .state('location-error', {
      url: '/location-error',
      templateUrl: '/components/errors/templates/index.html'
    })
    .state('unplugged-error', {
      url: '/unplugged-error',
      templateUrl: '/components/errors/templates/index.html'
    })
    .state('car-damage', {
      url: '/car/damage',
      templateUrl: '/components/cars/templates/damage.html'
    });
  $urlRouterProvider.otherwise('/cars');
}

angular.module('app', [
  'ionic',
  'ngResource',
  'Maps',
  'Maps.realReach',
  'Maps.route',
  'Maps.geoCoding',
  'countdown',
  'ads',
  'mockBehaviours',
  'ChargingStations',
  'PointsOfInterest',
  'ngFitText',
  'btford.socket-io',
  'layout',
  'Camera'
])
// .directive('overlayDialog',dialogDirective)
.run(['$ionicPlatform', Run])
.config([ '$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$httpProvider','$compileProvider', Config ]);
