'use strict';
var angular = require('angular');
var _ = require('lodash');

angular.module('app.services').factory('$session', [
  '$rootScope',
  '$window',
  function ($rootScope, $window) {

    var session = {

      data: {},

      load: function () {
        angular.forEach($window.localStorage, function (value, key) {

          if ($window.localStorage.hasOwnProperty(key)) {
            try {
              session.data[key] = value && JSON.parse(value);
            } catch (err) {
              $rootScope.$emit('sessionParseError', err);
            }
          }

        });

        return this;

      },

      has: function (key) {
        if (_.isEmpty(this.data)) {
          this.load();
        }
        return !_(this.data[key]).isUndefined();

      },

      get: function (key) {
        if (_.isEmpty(this.data)) {
          this.load();
        }
        return _(this.data[key]).isUndefined() ? {} : this.data[key];

      },

      set: function (key, value) {
        this.data[key] = value;
        return this;
      },

      save: function () {
        angular.forEach(this.data, function (value, key) {
          // stripped of angular-specific $$ properties
          var val = angular.fromJson(angular.toJson(value));
          $window.localStorage[key] = JSON.stringify(val);
        });

        return this;

      },

      purge: function (key) {
        if (key) {
          delete this.data[key];
          delete $window.localStorage[key];
        } else {
          this.data = {};
          $window.localStorage.clear();
        }

        return this;

      }

    };

    return session.load();

  }

]);
