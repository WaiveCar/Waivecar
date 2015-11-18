/* global window: false */
'use strict';
require('ionic-angular');
require('ngCordova');
require('../services/auth-interceptor');
var sprintf = require('sprintf-js').sprintf;
var ionic = require('ionic');

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

    // var baseUrl;
    // if (ionic.Platform.isWebView()) {
    //   baseUrl = 'http://192.168.57.1:8081';
    // } else {
    //   if (window.location.hostname === 'localhost') {
    //     baseUrl = 'http://localhost:8081';
    //   } else {
    //     throw new Error('baseUrl undefined for hostname ' + window.location.hostname);
    //   }
    // }
    // $settingsProvider.setBaseUrl(baseUrl);

    $settingsProvider.setSkobblerApiKey('8698d318586c58a1f8ca1e88ecfac299');

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

    $httpProvider.interceptors.push('AuthInterceptor');

    $ionicConfigProvider.views.transition('none');
    $ionicConfigProvider.views.maxCache(0);
    $ionicConfigProvider.templates.maxPrefetch(1);

    $provide.decorator('$exceptionHandler', [
      '$delegate',
      function exceptionHandlerDecorator($delegate) {

        return function(exception, cause) {
          var $message = $injector.get('$messageProvider').$get();
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

          $message.error(data.message);

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
  '$cordovaKeyboard',
  '$cordovaStatusbar',
  '$ionicPlatform',
  function Run($cordovaKeyboard, $cordovaStatusbar, $ionicPlatform) {

    $ionicPlatform.ready(function() {

      if (ionic.Platform.isWebView()) {

        $cordovaKeyboard.hideAccessoryBar(true);
        // styles: Default : 0, LightContent: 1, BlackTranslucent: 2, BlackOpaque: 3
        $cordovaStatusbar.style(1);

      }

    });

  }
];

module.exports = {
  config: config,
  run: run
};
