'use strict';
var angular = require('angular');
var inside = require('point-in-polygon');

angular.module('app.services')
  .service('GeofencingService', GeofencingService);

GeofencingService.$inject = ['LocationService', 'geofenceCoords'];

function GeofencingService(LocationService, geofenceCoords) {

  this.insideBoundary = function insideBoundary(backup) {
    return LocationService.getLocation().then(function(coords) {
      if(!coords && backup) {
        coords = backup;
      }
      if(coords && 'longitude' in coords) {
        return inside([coords.longitude, coords.latitude], geofenceCoords);
      } else {
        return false;
      }
    });
  };
}
