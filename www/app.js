
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

function Config($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  'use strict';
  $ionicConfigProvider.views.transition('platform');
  $stateProvider
    // FIND WAIVECARS
    .state('cars', {
      url: '/cars',
      templateUrl: '/components/cars/templates/index.html'
    })
    // BOOK WAIVECAR
    .state('cars-show', {
      url: '/cars/:id',
      templateUrl: '/components/cars/templates/show.html'
    })
    // .state('cars-edit', {
    //   url: '/cars/:id/edit',
    //   templateUrl: '/components/cars/templates/edit.html'
    // })
    // PAST RIDES
    .state('bookings', {
      url: '/bookings',
      templateUrl: '/components/bookings/templates/index.html'
    })
    // details yet to be
    .state('bookings-new', {
      url: '/bookings/new',
      templateUrl: '/components/bookings/templates/new.html'
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
    .state('account', {
      url: '/my-account',
      templateUrl: '/components/users/templates/index.html'
    })
    .state('points', {
      url: '/my-points',
      templateUrl: '/components/users/templates/reward-points.html'
    })
    //All purposes ads
    .state('ads',{
      url:'/ads',
      templateUrl: '/components/ads/templates/index.html',
      params:{redirectUrl:null,redirectParams:null}
    })
    .state('location-error', {
      url: '/location-error',
      templateUrl: '/components/errors/templates/location.html'

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
  'ads'
])
.run(['$ionicPlatform', Run])
.config([ '$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', Config ]);