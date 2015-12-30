/* global L:true */
'use strict';

var angular = require('angular');
var _ = require('lodash');

function $distanceFactory ($rootScope) {
  function DistanceService () {
  }

  DistanceService.prototype.getDistance = function getDistance (to, from) {
    from = from || $rootScope.currentLocation;
    if (!(isValidLocation(to) && isValidLocation(from))) {
      return NaN;
    }
    var _from = latLng($rootScope.currentLocation);
    var _to = latLng(to);
    if (!from || !to) {
      return NaN;
    }
    var distance = _from.distanceTo(_to);
    return this.toMiles(distance);
  };

  DistanceService.prototype.closest = function closest (arr) {
    return _(arr)
      .map(function (car) {
        return this.getDistance(car);
      }, this)
      .sortBy()
      .first();
  };

  DistanceService.prototype.toMiles = function toMiles (m) {
    if (isNaN(m)) {
      return m;
    }
    return m / 1609;
  };
  return new DistanceService();
}

function isValidLocation (loc) {
  if (!loc) {
    return false;
  }
  return (loc.latitude && loc.longitude) ||
    (Array.isArray(loc) && loc.length === 2 &&
      typeof loc[0] === 'number' &&
      typeof loc[1] === 'number'
    );
}

function latLng (loc) {
  if (Array.isArray(loc)) {
    return L.latLng(loc[0], loc[1]);
  } else {
    return L.latLng(loc.latitude, loc.longitude);
  }
  return null;
}

module.exports = angular.module('app.services').factory('$distance', [
  '$rootScope',
  $distanceFactory]);
