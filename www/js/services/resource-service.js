'use strict';
var angular = require('angular');

module.exports = angular.module('app.services').factory('Resource', [
  '$resource',
  '$settings',
  function ($resource, $settings) {

    return function (url, params, methods) {
      var defaults = {
        update: {
          method: 'PUT',
          isArray: false
        },
        create: {
          method: 'POST'
        },
        destroy: {
          method: 'DELETE'
        }
      };

      url = $settings.uri.api + url;

      methods = angular.extend(defaults, methods);

      var resource = $resource(url, params, methods);

      resource.prototype.$save = function () {
        if (!this.id) {
          return this.$create();
        } else {
          return this.$update();
        }
      };

      return resource;
    };

  }
]);
