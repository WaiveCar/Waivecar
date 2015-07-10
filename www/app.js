
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

function Config($stateProvider, $urlRouterProvider) {
  'use strict';
  $stateProvider
    // FIND WAIVECARS
    .state('search', {
      url: '/find-waivecars',
      templateUrl: '/components/search/templates/index.html'
    })
    // PAST RIDES
    .state('bookings', {
      url: '/bookings',
      templateUrl: '/components/bookings/templates/index.html'
    })
    // BOOK WAIVECAR
    .state('bookings-new', {
      url: '/bookings/new',
      templateUrl: '/components/bookings/templates/new.html'
    })
    // GET TO YOUR CAR
    .state('bookings-show', {
      url: '/bookings/:id',
      templateUrl: '/components/bookings/templates/show.html'
    })
    .state('bookings-edit', {
      url: '/bookings/:id/edit',
      templateUrl: '/components/bookings/templates/edit.html'
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
    .state('vehicle-details', {
      url: '/vehicleDetails',
      templateUrl: '/components/search/templates/vehicleDetails.html',
      params : { vehicleDetails: null}

    })
    .state('points', {
      url: '/my-points',
      templateUrl: '/components/users/templates/reward-points.html'
    });

  $urlRouterProvider.otherwise('/find-waivecars');
}

angular.module('app', [
  'ionic',
  'ngResource',
  'Maps',
  'Maps.realReach',
  'Maps.fleet',
  'Maps.route'
])
.run(['$ionicPlatform', Run])
.config([ '$stateProvider', '$urlRouterProvider', Config ]);
