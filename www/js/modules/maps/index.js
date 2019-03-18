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
  .constant('transports', {
    car: 'car',
    pedestrian: 'pedestrian'
  });

require('./directives/google-map-directive');
