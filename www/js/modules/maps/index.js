angular.module('Maps', ['ngCordova'])
 .constant('MapsEvents', {
   'routeDurationChanged'  : 'waiveCarRouteDurationChanged',
   'routeDistanceChanged'  : 'waiveCarRouteDistanceChanged',
   'positionChanged'       : 'waiveCarPositionChanged',
   'destinyOnRouteChanged' : 'waiveCarDestinyOnRouteChanged',
   'withinUnlockRadius'    : 'waiveCarWithinUnlockRadius',
   'markersChanged'        : 'waiveCarMarkersChanged'
 })
.constant('skobblerApiCodes', {
  'sourceSameAsDestination' :'680'
})
.constant('transports', {
  car        : 'car',
  pedestrian : 'pedestrian'
});
