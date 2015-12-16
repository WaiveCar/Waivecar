'use strict';
var angular = require('angular');
var appSettings = angular.module('app.settings');
module.exports = appSettings;

appSettings.provider('$settings', [

  function Config() {

    var skobblerKey;
    var _this = this;

    // Overriden in app-setup
    this.baseUrl = 'http://localhost:8081';
    this.facebook = {
      clientId: '1022704731082512',
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

    this.setSkobblerApiKey = function(key){
      skobblerKey = key;
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

          facebook: getFacebook(),
          skobbler: {
            key: skobblerKey
          }

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
