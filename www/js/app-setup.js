/* global window: false */
'use strict';
require('ionic-angular');
require('ngCordova');
require('./services/auth-interceptor');
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
  function ($ionicConfigProvider, $stateProvider, $locationProvider, $httpProvider, $urlRouterProvider, $compileProvider, $provide, $injector) {

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

    $httpProvider.interceptors.push('AuthInterceptor');

    $ionicConfigProvider.views.transition('platform');

    $provide.decorator('$exceptionHandler', [
      '$delegate',
      function ($delegate) {

        return function (exception, cause) {
          var $message = $injector.get('$messageProvider').$get();
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

    $ionicPlatform.ready(function () {

      if (ionic.Platform.isWebView()) {

        $cordovaKeyboard.hideAccessoryBar(true);
        // styles: Default : 0, LightContent: 1, BlackTranslucent: 2, BlackOpaque: 3
        $cordovaStatusbar.style(0);

      }

    });

  }
];

module.exports = {
  config: config,
  run: run
};
