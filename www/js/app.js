'use strict';

angular.module('app.controllers', []);
angular.module('app.directives', []);
angular.module('app.filters', []);
angular.module('app.providers', []);
angular.module('app.services', []);

window.app = angular.module('app', [
  'ionic',
  'ngResource',
  'ngMessages',
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
  'MockBehaviors'
  // 'countdown',
  // 'ads',
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
  '$provide',
  '$injector',
  function ($ionicConfigProvider, $stateProvider, $locationProvider, $httpProvider, $urlRouterProvider, $compileProvider, $provide, $injector) {

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

    $httpProvider.interceptors.push('AuthInterceptor');

    $ionicConfigProvider.views.transition('platform');

    $provide.decorator("$exceptionHandler", [
      '$delegate',
      '$window',
      function ($delegate, $window) {

        return function (exception, cause) {
          var $message = $injector.get("$messageProvider").$get();
          $delegate(exception, cause);

          var data = {
            type: 'angular',
            url: window.location.hash,
            localtime: Date.now()
          };
          if (cause) {
            data.cause = cause;
          }

          if (exception) {
            if (exception.message) {
              data.message = exception.message;
            }
            if (exception.name) {
              data.name = exception.name;
            }
            if (exception.stack) {
              data.stack = exception.stack;
            }
          }

          $message.error(data.message);

          // catch exceptions out of angular
          window.onerror = function (message, url, line, col, error) {
            var $message = $injector.get("$messageProvider").$get();

            // var stopPropagation = debug ? false : true;
            var data = {
              type: 'javascript',
              url: window.location.hash,
              localtime: Date.now()
            };
            if (message) {
              data.message = message;
            }
            if (url) {
              data.fileName = url;
            }
            if (line) {
              data.lineNumber = line;
            }
            if (col) {
              data.columnNumber = col;
            }
            if (error) {
              if (error.name) {
                data.name = error.name;
              }
              if (error.stack) {
                data.stack = error.stack;
              }
            }

            // $message.error(data.message);
            // console.log(data.message);
            return true;
            // return stopPropagation;

          };
        }
      }
    ]);

    // not required:
    // 9-Connect with facebook@2x.png
    // guide only:
    // 10-Inline-errors@2x.png

    // not states:
    // 13-Nav@2x.png (a template found in /common)
    // 17-Reach-notification@2x.png (not moved yet in to /common - it is a notification)

    // yet to sift through:
    // 20-Dashboard@2x.png
    // 21-Selected-charging-station@2x.png
    // 22-Dashboard-paying-user@2x.png
    // 23-Summary@2x.png
    // 24-End-ride-all-good-not-charging@2x.png
    // 25-Error-not-charging@2x.png
    // 26-End-ride-no-battery@2x .png
    // 27-Low-battery@2x.png
    // 28-Low-time@2x.png
    // 33-Summary@2x.png

    $stateProvider
      // 1-Intro@2x.png
      .state('landing', {
        cache       : false,
        url         : '/',
        templateUrl : '/templates/landing/index.html'
      })
      // 2-Register-sign-in@2x.png
      .state('auth', {
        url         : '/auth',
        templateUrl : '/templates/auth/index.html',
        data        : {
          auth : false
        }
      })
      // 3-Sign in@2x.png / 4-Sign-in-error@2x.png
      .state('auth-login', {
        cache       : false,
        url         : '/auth/login',
        templateUrl : '/templates/auth/login.html',
        data        : {
          auth : false
        }
      })
      // 5-Forgot-password@2x.png / 6-Forgot-password-success@2x.png / 7-Forgot-password-error@2x.png
      .state('auth-forgot-password', {
        cache       : false,
        url         : '/auth/forgot-password',
        templateUrl : '/templates/auth/forgot-password.html',
        data        : {
          auth : false
        }
      })
      // Screen not in Invision, but required. (enter reset code to reset password)
      .state('auth-reset-password', {
        cache       : false,
        url         : '/auth/reset-password',
        templateUrl : '/templates/auth/reset-password.html',
        data        : {
          auth : false
        }
      })
      // 32-Past-rides@2x.png
      .state('bookings', {
        url         : '/bookings',
        templateUrl : '/templates/bookings/index.html',
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
      // 16-Get-your-waivecar@2x.png
      // 18-WaiveCar-connect@2x.png
      .state('bookings-edit', {
        url         : '/bookings/:id/edit',
        templateUrl : '/templates/bookings/edit.html',
        data        : {
          auth : true
        }
      })
      // 19-Connecting-to-waivecar@2x .png
      // 19.1-Reporta-problem@2x.png
      // 19.2-Report-problem-success@2x.png
      .state('bookings-prepare', {
        url         : '/bookings/:id/prepare',
        templateUrl : '/templates/bookings/prepare.html',
        data        : {
          auth : true
        }
      })
      .state('bookings-in-progress', {
        url         : '/bookings/:id/in-progress',
        templateUrl : '/templates/bookings/in-progress.html',
        data        : {
          auth : true
        }
      })
      // 14-Find-waivecar@2x .png
      .state('cars', {
        url         : '/cars',
        templateUrl : '/templates/cars/index.html'
      })
      // 15-Book-waivecar@2x.png
      .state('cars-show', {
        url         : '/cars/:id',
        templateUrl : '/templates/cars/show.html'
      })
      // 34-Contact@2x.png / 35-Message-confirmation@2x.png
      .state('messages-new', {
        url         : '/messages/new',
        templateUrl : '/templates/messages/new.html'
      })
      // 31-Payment-method@2x.png BUT SHOULD SHOW LAST 4 Digits (and perhaps even a List of all registered cards)
      .state('credit-cards', {
        url         : '/credit-cards',
        templateUrl : '/templates/credit-cards/index.html',
        data        : {
          auth : true
        }
      })
      // 12-Payment-method@2x.png
      .state('credit-cards-new', {
        url         : '/credit-cards/new',
        templateUrl : '/templates/credit-cards/new.html',
        data        : {
          auth : true
        }
      })
      // 8-Register@2x.png
      .state('users-new', {
        url         : '/users/new',
        templateUrl : '/templates/users/new.html',
        data        : {
          auth : false
        }
      })
      // 29-Account-editing@2x.png / 29-Account-saved@2x.png / 29-Account@2x.png / 29.1-Account@2x.png / 29.2-Account@2x.png
      .state('users-edit', {
        url         : '/users/:id/edit',
        templateUrl : '/templates/users/edit.html',
        data        : {
          auth : true
        }
      })
      // 11.1-Drivers-id@2x.png
      .state('licenses-new', {
        url         : '/licenses/new',
        templateUrl : '/templates/licenses/new.html',
        data        : {
          auth : true
        }
      })
      .state('licenses-show', {
        url: '/licenses/:id',
        templateUrl: '/templates/licenses/show.html',
        data: {
          auth: true
        }
      })
    // 11-Drivers-id@2x.png / 11.05-Drivers-id-uploading-photo@2x.png / 11.06-Drivers-id-photo-uploaded@2x.png //     / 30-Drivers-license@2x.png
    .state('licenses-edit', {
      url: '/licenses/:id/edit',
      templateUrl: '/templates/licenses/edit.html',
      data: {
        auth: true
      }
    })
    // 36-Our-vision@2x.png
    .state('vision', {
      url: '/vision',
      templateUrl: '/templates/vision/index.html',
      data: {
        auth: true
      }
    })

    .state('ads', {
      url: '/ads',
      templateUrl: '/templates/ads/index.html',
      params: {
        redirectUrl: null,
        redirectParams: null
      }
    })

    .state('errors-show', {
      url: '/errors/:id',
      templateUrl: '/templates/errors/show.html'
    });

    $urlRouterProvider.otherwise('/');

  }
]);

window.app.run([
  '$ionicPlatform',
  '$rootScope',
  function Run($ionicPlatform, $rootScope) {
    $ionicPlatform.ready(function () {
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
