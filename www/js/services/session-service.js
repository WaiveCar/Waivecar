'use strict';
var angular = require('angular');
var _ = require('lodash');

function session ($rootScope, $window) {
  function Session () {
    this.data = {};
    this.load();
  }

  Session.prototype.load = function load () {
    this.data = _.mapValues($window.localStorage, function (value) {
      try {
        return value && JSON.parse(value);
      } catch (err) {
        $rootScope.$emit('sessionParseError', err);
      }
    });
  };

  Session.prototype.has = function has (key) {
    if (_.isEmpty(this.data)) {
      this.load();
    }
    return !_(this.data[key]).isUndefined();
  };

  Session.prototype.get = function get (key) {
    if (_.isEmpty(this.data)) {
      this.load();
    }
    return _.isUndefined(this.data[key])
      ? null
      : this.data[key];
  };

  Session.prototype.set = function set (key, value) {
    this.data[key] = value;
    return this;
  };

  Session.prototype.save = function save () {
    _.forEach(this.data, function (value, key) {
      if (typeof value === 'undefined') {
        return;
      }
      // stripped of angular-specific $$ properties
      var val = angular.fromJson(angular.toJson(value));
      $window.localStorage[key] = JSON.stringify(val);
    });

    return this;
  };

  Session.prototype.purge = function purge (key) {
    if (key) {
      delete this.data[key];
      delete $window.localStorage[key];
    } else {
      this.data = {};
      $window.localStorage.removeItem('auth');
      $window.localStorage.removeItem('me');
    }

    return this;
  };

  return new Session();
}

angular.module('app.services').factory('$session', [
  '$rootScope',
  '$window',
  session
]);
