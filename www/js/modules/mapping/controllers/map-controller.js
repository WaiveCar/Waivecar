angular.module('app.modules.mapping.controllers').controller('MapController', [
  '$scope',
  '$q',
  '$mapRoute',
  '$mapLocation',
  function($scope, $q, $mapRoute, $mapLocation) {
    'use strict';

    this._deferedMap = $q.defer();
    this._deferedDestiny = $q.defer();
    this._deferedLocation = $q.defer();

    this.mapInstance = this._deferedMap.promise;
    this.locationMarker = this._deferedLocation.promise;
    this.destinyMarker = this._deferedDestiny.promise;

    this.solveMap = function(mapInstance) {
      this._deferedMap.resolve(mapInstance);
    };

    this.solveLocation = function(locationMarker) {
      this._deferedLocation.resolve(locationMarker);
    };

    this.solveDestiny = function(destinyMarker) {
      this._deferedDestiny.resolve(destinyMarker);
    };
  }
]);
