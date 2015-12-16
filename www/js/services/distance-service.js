/* global L:true */
'use strict';

var angular = require('angular');
var _ = require('lodash');

function DistanceService ($rootScope) {
  this.location = $rootScope.currentLocation;
}

DistanceService.prototype.getDistance = function getDistance (to, from) {
  from = from || this.location;
  if (!(isValidLocation(to) && isValidLocation(from))) {
    return NaN;
  }
  var _from = latLng(this.location);
  var _to = latLng(to);
  if (!from || !to) {
    return NaN;
  }
  var distance = _from.distanceTo(_to);
  // return miles
  return distance / 1609;
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
  return m / 1609;
};

function isValidLocation (loc) {
  console.log(loc);
  //if (!loc) return false;
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

module.exports = angular.module('app.services').service('$distance', [
  '$rootScope',
  DistanceService]);
