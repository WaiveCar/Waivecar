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

require('./controllers/map-controller');

require('./directives/locate-me-directive');
require('./directives/location-marker-directive');
require('./directives/location-markers-directive');
require('./directives/map-directive');
require('./directives/route-to-location-directive');
require('./directives/route-distance-directive');
require('./directives/route-duration-directive');

require('./services/location-service');
require('./services/real-reach-service');
require('./services/route-service');
