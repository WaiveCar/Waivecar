'use strict';
var angular = require('angular');
var appSettings = angular.module('app.settings');
module.exports = appSettings;

appSettings.provider('$settings', [

  function Config() {

    var _this = this;

    // Overriden in app-setup
    this.baseUrl = 'https://api-waivecar-dev.cleverbuild.biz';
    this.facebook = {
      clientId: '1022707721082213', // '783941098370564',
    };

    function getBaseUrl() {
      return _this.baseUrl;
    }

    function getFacebook(){
      return _this.facebook;
    }

    this.setBaseUrl = function(baseUrl) {
      _this.baseUrl = baseUrl;
    };

    this.$get = [

      function() {
        return {
          uri: {
            api: getBaseUrl(),
            auth: {
              login: getBaseUrl() + '/auth/login',
              logout: getBaseUrl() + '/auth/logout',
              forgot: getBaseUrl() + '/auth/forgot-password',
              reset: getBaseUrl() + '/auth/reset-password'
            }
          },

          facebook: getFacebook()

        };

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
