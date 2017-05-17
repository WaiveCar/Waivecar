/* global L:true */
'use strict';

var angular = require('angular');
var _ = require('lodash');

function $distance ($rootScope) {
  function getDistance (to, from) {
    from = from || $rootScope.currentLocation;
    if (!(isValidLocation(to) && isValidLocation(from))) {
      return NaN;
    }
    var _from = latLng(from);
    var _to = latLng(to);
    if (!_from || !_to) {
      return NaN;
    }
    var distance = _from.distanceTo(_to);
    return toMiles(distance);
  };

  getDistance.fallback = function (to, from) {
    var attempt = getDistance(to);
    if (isNaN(attempt)) {

      // TODO: THIS IS A TERRIBLE PLACE TO DO THIS
      //   THIS IS A SIDE-EFFECT, A PRETTY BIG ONE
      //   BUT IT'S ALSO THE EASIEST PLACE.
      $rootScope.currentLocation = from;

      attempt = getDistance(to, from);
    }
    return attempt;
  };

  return getDistance;
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
