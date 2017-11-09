'use strict';
var angular = require('angular');
var inside = require('point-in-polygon');

angular.module('app.services')
  .service('GeofencingService', GeofencingService);

GeofencingService.$inject = ['LocationService', 'geofenceCoords', '$rootScope'];

function GeofencingService(LocationService, geofenceCoords, $rootScope) {

  this.insideFastCheck = function insideBoundary(car, shape) {
    shape = shape || geofenceCoords;
    var coords = $rootScope.currentLocation || car;
    if(coords && 'longitude' in coords) {
      return inside([coords.longitude, coords.latitude], shape);
    }
  };

  // backup is used if the location services fail to get a gps read
  // this should probably be the car gps
  this.insideBoundary = function insideBoundary(backup, shape) {
    shape = shape || geofenceCoords;
    return LocationService.getLocation().then(function(coords) {
      if(!coords && backup) {
        coords = backup;
      }
      if(coords && 'longitude' in coords) {
        return inside([coords.longitude, coords.latitude], shape);
      } else {
        return false;
      }
    });
  };
}
