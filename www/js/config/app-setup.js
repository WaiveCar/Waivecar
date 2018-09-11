/* global window: false */
'use strict';
require('ionic-angular');
require('ngCordova');
require('../services/auth-interceptor');
var ionic = require('ionic');
var _ = require('lodash');

var config = [
  '$ionicConfigProvider',
  '$stateProvider',
  '$locationProvider',
  '$httpProvider',
  '$urlRouterProvider',
  '$compileProvider',
  '$provide',
  '$injector',
  '$settingsProvider',
  'MapsLoaderProvider',
  function($ionicConfigProvider, $stateProvider, $locationProvider, $httpProvider, $urlRouterProvider, $compileProvider, $provide, $injector, $settingsProvider, MapsLoaderProvider) {

    MapsLoaderProvider.setApiKey('8698d318586c58a1f8ca1e88ecfac299');

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

    $httpProvider.interceptors.push('AuthInterceptor');

    $ionicConfigProvider.views.transition('none');
    $ionicConfigProvider.views.maxCache(0);
    $ionicConfigProvider.templates.maxPrefetch(1);
    $ionicConfigProvider.backButton.text('').icon('').previousTitleText(false);

    $provide.decorator('$exceptionHandler', [
      '$delegate',
      // '$log',
      function exceptionHandlerDecorator($delegate) {

        return function(exception, cause) {

          // var $log = $injector.get('$log');

          $delegate(exception, cause);
          // throw exception;

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

          // $log.error(data.message);

          // catch exceptions out of angular
          window.onerror = function(message, url, line, col, error) {
            // var $msg = $injector.get("$messageProvider").$get();

            // var stopPropagation = debug ? false : true;
            var _data = {
              type: 'javascript',
              url: window.location.hash,
              localtime: Date.now()
            };
            if (message) {
              _data.message = message;
            }
            if (url) {
              _data.fileName = url;
            }
            if (line) {
              _data.lineNumber = line;
            }
            if (col) {
              _data.columnNumber = col;
            }
            if (error) {
              if (error.name) {
                _data.name = error.name;
              }
              if (error.stack) {
                _data.stack = error.stack;
              }
            }

            // $message.error(data.message);
            // console.log(data.message);
            return true;
            // return stopPropagation;

          };

        };

      }
    ]);

  }
];

var run = [
  '$rootScope',
  '$cordovaKeyboard',
  '$ionicPlatform',
  '$auth',
  '$state',
  'IntercomService',
  '$ionicSideMenuDelegate',
  function Run($rootScope, $cordovaKeyboard, $ionicPlatform, $auth, $state, IntercomService, $ionicSideMenuDelegate) {
    /*
    $ionicPlatform.ready(function() {
      if (ionic.Platform.isWebView()) {
        $cordovaKeyboard.hideAccessoryBar(false);
      }
    });
    */
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

      //console.log(toState, fromState, JSON.stringify($auth.me));
      var authRequired;
      if (toState && _.has(toState, 'data') && _.has(toState.data, 'auth')) {
        authRequired = toState.data.auth;
      }
      var isAuthenticated = $auth.isAuthenticated();

      if ($auth.bypass) {
        return true;
      }

      if ($auth.me && $auth.me.phone && !$auth.me.verifiedPhone && toState.name !== 'auth-account-verify') {
        event.preventDefault();
        $state.go('auth-account-verify', { step: 2 });
      } else if (isAuthenticated && !_.isUndefined(authRequired) && authRequired === false && $auth.me.tested) {
        /*       event.preventDefault();
        if($auth.me.booking) {
          if($auth.me.booking.status === 'started') {
            $state.go('dashboard', { id: $auth.me.booking.id });
          } else {
            // this seems to do some kind of auth setup
            $state.go('cars');
          }
        } else {
          $state.go('cars');
        }*/
      } else if (!isAuthenticated && authRequired) {
        event.preventDefault();
        $state.go('auth');
        // if we can't figure out where else to go and we've falled through here
        // then the chances are that the user still needs to set up more of their
        // account so we drop them into the account setup page.
      } else if(isAuthenticated && fromState.name === '' && toState.name !== 'users-edit' && !$auth.me.tested) {
        event.preventDefault();
        $state.go('users-edit');
      }

      var showIntercom = toState && toState.data && toState.data.intercom;
      var bottomPadding = 35;

      if(toState && toState.data && toState.data.intercomPadding) {
        bottomPadding = toState.data.intercomPadding;
      }

      // This was from an unfinished, improper merge, cjm is at fault
      // for the merge... check the git blame
      //IntercomService.setBottomPadding(bottomPadding);
      IntercomService.setLauncherVisibility(showIntercom);
    });

  }
];

module.exports = {
  config: config,
  run: run
};
