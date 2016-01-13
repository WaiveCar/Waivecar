/* global localStorage */
'use strict';
var angular = require('angular');
var _ = require('lodash');
var appSettings = angular.module('app.settings');
module.exports = appSettings;

var defaults = {
  baseUrl: 'https://api-waivecar-dev.cleverbuild.biz',
  skobbler: {
    key: '8698d318586c58a1f8ca1e88ecfac299',
  },
  facebook: {
    clientId: '1022704731082512'
  }
};

appSettings.provider('$settings', [
  function Config() {
    var env = localStorage.env;
    console.log('[settings] using `%s` environment', env);
    var envs = {};
    envs.prod = _.extend({}, defaults, {
      baseUrl: 'https://api.waivecar.com'
    });
    envs.dev = _.extend({}, defaults);
    var config = envs[env] || envs.prod;

    this.$get = [
      function() {
        return {
          uri: {
            api: config.baseUrl,
            auth: {
              login: config.baseUrl + '/auth/login',
              logout: config.baseUrl + '/auth/logout',
              forgot: config.baseUrl + '/auth/forgot-password',
              reset: config.baseUrl + '/auth/reset-password'
            }
          },
          facebook: config.facebook,
          skobbler: config.skobbler,
          phone: '855-WAIVE55'
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

appSettings
  .constant('mapsEvents', {
    routeDurationChanged: 'waiveCarRouteDurationChanged',
    routeDistanceChanged: 'waiveCarRouteDistanceChanged',
    positionChanged: 'waiveCarPositionChanged',
    destinyOnRouteChanged: 'waiveCarDestinyOnRouteChanged',
    withinUnlockRadius: 'waiveCarWithinUnlockRadius',
    markersChanged: 'waiveCarMarkersChanged'
  })
  .constant('transports', {
    pedestrian: 'pedestrian',
    car: 'car'
  });
