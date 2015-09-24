'use strict';
var angular = require('angular');
var ionic = require('ionic');
var baseUrl = 'https://api-waivecar-dev.cleverbuild.biz';

var appSettings = angular.module('app.settings', []);
module.exports = appSettings;

appSettings.provider('$settings', [

  function Config() {

    var baseUrl = ionic.Platform.isWebView() ? 'http://10.0.3.2:3000' : 'http://localhost:3000';
    var _this = this;

    this.settings = {

      uri: {
        api: baseUrl,
        auth: {
          login: baseUrl + '/auth/login',
          logout: baseUrl + '/auth/logout',
          forgot: baseUrl + '/auth/forgot-password',
          reset: baseUrl + '/auth/reset-password'
        }
      },

      facebook: {
        clientId: '1022707721082213', // '783941098370564',
        url: baseUrl + '/auth/facebook'
      }

    };

    this.$get = [

      function () {
        return _this.settings;
      }
    ];
  }

]);

appSettings
  .constant('countdownEventsConstant', {
    newCounter: 'waivecarCounterStarted',
    counterCancelled: 'waivecarCounterCancelled',
    counterStateChanged: 'waivecarCounterStateChanged',
    counterStateFinished: 'waivecarCounterStateFinnished'
  });

appSettings
  .constant('timerStatesConstant', {
    started: 'started',
    stopped: 'stopped'
  });
