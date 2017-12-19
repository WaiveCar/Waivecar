'use strict';
var angular = require('angular');
require('ngCordova');

module.exports = angular.module('Maps', ['ngCordova'])
  .constant('MapsEvents', {
    routeDurationChanged: 'waiveCarRouteDurationChanged',
    routeDistanceChanged: 'waiveCarRouteDistanceChanged',
    positionChanged: 'waiveCarPositionChanged',
    destinyOnRouteChanged: 'waiveCarDestinyOnRouteChanged',
    withinUnlockRadius: 'waiveCarWithinUnlockRadius',
    markersChanged: 'waiveCarMarkersChanged'
  })
  .constant('skobblerApiCodes', {
    sourceSameAsDestination: '680'
  })
  .constant('transports', {
    car: 'car',
    pedestrian: 'pedestrian'
  });

require('./directives/locate-me-directive');
require('./directives/google-map-directive');
require('./directives/route-distance-directive');
require('./directives/route-duration-directive');

require('./services/real-reach-service');
require('./services/route-service');
