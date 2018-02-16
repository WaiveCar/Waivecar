/* global localStorage */
/* global window */
'use strict';
var angular = require('angular');
var _ = require('lodash');
var appSettings = angular.module('app.settings');
module.exports = appSettings;

var defaults = {
  baseUrl: 'http://local.waivecar.com:3080',
  skobbler: {
    key: '8698d318586c58a1f8ca1e88ecfac299',
  },
  zendrive: {
    key: 'vqt01cZ58eUQHtdqkZOzaATWZXFjnV2p'
  },
  facebook: {
    clientId: '1022704731082512'
  }
};

appSettings.provider('$settings', [
  function Config() {
    var env = localStorage.env;
    var envs = {};
    envs.local = envs.dev = _.extend({}, defaults, {
      baseUrl: 'http://localhost:3000'
    });
    envs.prod = _.extend({}, defaults, {
      baseUrl: 'https://api.waivecar.com'
    });
    envs.staging = _.extend({}, defaults, {
      baseUrl: 'http://staging.waivecar.com:4300'
    });

    if(window.location.host.match(/^localhost/) && !localStorage.env) {
      env = 'local';
    }

    var config = envs[env] || envs.prod;
    console.log('[settings] using `%s` environment', env || 'prod');

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
          zendrive: config.zendrive,
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

appSettings
  .constant('notificationReasons', {
    outsideRange: 'OUTSIDE_RANGE',
    lowCharge: 'LOW_CHARGE'
  });

appSettings
  .constant('geofenceCoords', [
    [ -118.494651, 34.050775 ],
    [ -118.483794, 34.041583 ],
    [ -118.477206, 34.046757 ],
    [ -118.459074, 34.031536 ],
    [ -118.457808, 34.032016 ],
    [ -118.457122, 34.029883 ],
    [ -118.452852, 34.028122 ],
    [ -118.442895, 34.016171 ],
    [ -118.456929, 34.009465 ],
    [ -118.483386, 33.995288 ],
    [ -118.496776, 34.008416 ],
    [ -118.499393, 34.006744 ],
    [ -118.500724, 34.007775 ],
    [ -118.498235, 34.009234 ],
    [ -118.517311, 34.025081 ],
    [ -118.512526, 34.030523 ],
    [ -118.508770, 34.033243 ],
    [ -118.508148, 34.039343 ],
    [ -118.504565, 34.041227 ],
    [ -118.494673, 34.050704 ]
  ]);

appSettings
  .constant('homebase', {
    latitude: 34.016512,
    longitude: -118.489028
  });
