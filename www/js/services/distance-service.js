/* global L:true */
'use strict';

var angular = require('angular');
var _ = require('lodash');

function $distance ($rootScope) {
  return function getDistance (to, from) {
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
    return toMiles(distance);
  };
}

function toMiles (m) {
  if (!_.isFinite(m)) {
    return m;
  }
  return m / 1609;
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

module.exports = angular.module('app.services').service('$distance', [
  '$rootScope',
  $distance]);
