
function Run($ionicPlatform,$rootScope,stateService) {
  stateService.init();
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

function Config($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider,$compileProvider,appStates) {
  'use strict';
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
  $httpProvider.interceptors.push('AuthInterceptor');
  $ionicConfigProvider.views.transition('platform');
  for(var state in appStates){
    $stateProvider.state(state,appStates[state]);
  }
  $urlRouterProvider.otherwise('/');
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
  'Camera',
  'WaiveCar.state.rules',
  'WaiveCar.state'
])
.constant('appStates',{
    'intro':{
      'url':'/',
      templateUrl: '/components/layout/templates/intro.html'
    },
    'signIn':{
      'url':'/signIn',
      templateUrl: '/components/login/templates/signIn.html'
    },
    'loginSignUp':{
      'url':'/login-sign-up',
      templateUrl: '/components/layout/templates/loginSignUp.html'
    },
    // FIND WAIVECARS
    'fleet':{
      url: '/fleet',
      templateUrl: '/components/cars/templates/fleet.html'
    },
    // SHOW WAIVECAR
    'cars-show':{
      url: '/cars/:id',
      templateUrl: '/components/cars/templates/show.html'
    },
    'users-new':{
      url         : '/users/new',
      templateUrl : '/components/users/templates/new.html'
    },
    'users-show':{
      url: '/users/:id',
      templateUrl: '/components/users/templates/show.html'
    },
    'credit-cards':{
      url         : '/users/cards',
      templateUrl : '/components/credit-cards/templates/index.html'
    },
    'credit-cards-new':{
      url         : '/users/cards/new',
      templateUrl : '/components/credit-cards/templates/new.html'
    },
    'licenses':{
      url         : '/users/licenses',
      templateUrl : '/components/licenses/templates/index.html'
    },
    'licenses-new':{
      url         : '/users/licenses/new',
      templateUrl : '/components/licenses/templates/new.html'
    },
    //Connect to car
    'cars-connect':{
      url: '/cars/connect/:id',
      templateUrl: '/components/cars/templates/connect.html'
    },
    'cars-connecting':{
      url: '/cars/connecting/:id',
      templateUrl: '/components/cars/templates/connecting.html'
    },

    'bookings':{
      url: '/bookings',
      templateUrl: '/components/bookings/templates/index.html'
    },
    'bookings-new':{
      url: '/bookings/new',
      templateUrl: '/components/bookings/templates/new.html'
    },
    // GET TO YOUR CAR
    'bookings-show':{
      url: '/bookings/:id',
      templateUrl: '/components/bookings/templates/show.html',
      params : { vehicleDetails: null},
    },
    'bookings-edit':{
      url: '/bookings/:id/edit',
      templateUrl: '/components/bookings/templates/edit.html'
    },
    'vision':{
      url: '/vision',
      templateUrl: '/components/vision/templates/index.html'
    },
    'contact':{
      url: '/contact',
      templateUrl: '/components/contact/templates/index.html'
    },
    'points':{
      url: '/my-points',
      templateUrl: '/components/users/templates/reward-points.html'
    },
    'dashboard':{
      url:'/ride/dashboard',
      templateUrl: '/components/ride/templates/dashboard.html'
    },
    'summary':{
      url:'/ride/summary',
      templateUrl: '/components/ride/templates/summary.html'
    },
    'paid-ride':{
      url:'/paid-ride',
      templateUrl: '/components/ride/templates/paidDashboard.html'
    },
   'ride-end':{
      url:'/ride/end',
      templateUrl: '/components/ride/templates/endRide.html'
    },
    'ride-end-low-charge':{
      url:'/ride/end/low-charge',
      templateUrl: '/components/ride/templates/endRideLowCharge.html'
    },
    'ride-alert-low-battery':{
      url:'/ride/alert/low-battery',
      templateUrl: '/components/ride/templates/lowBatteryAlert.html'
    },
    'ride-alert-free-ride':{
        url:'/ride/alert/free-ride',
        templateUrl: '/components/ride/templates/freeRideAlert.html'
    },
    //All purposes ads
    'ads':{
      url:'/ads',
      templateUrl: '/components/ads/templates/index.html',
      params:{redirectUrl:null,redirectParams:null},
    },
    'location-error':{
      url: '/location-error',
      templateUrl: '/components/errors/templates/index.html'
    },
    'unplugged-error':{
      url: '/unplugged-error',
      templateUrl: '/components/errors/templates/index.html'
    },
    'car-damage':{
      url: '/car/damage',
      templateUrl: '/components/cars/templates/damage.html'
    }

})
// .directive('overlayDialog',dialogDirective)
.config([ '$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$httpProvider','$compileProvider','appStates',Config ])
.run(['$ionicPlatform','$rootScope','WaiveCarStateService',Run]);
