'use strict';
var angular = require('angular');
require('../services/utils.js');

module.exports = angular.module('app').factory('Licenses', [
  '$resource',
  '$utils',
  function Resource($resource, $utils) {

    var resourceName = 'licenses';

    var birthDateTransform = function (data) {
      if (data.birthDate) {
        data.birthDate = moment(data.birthDate).format('YYYY-MM-DD');
      }
      return angular.toJson(data);

    };

    var customMethods = {
      save: {
        method: 'POST',
        url: $utils.getRoute(resourceName),
        transformRequest: birthDateTransform
      },
      update: {
        method: 'PUT',
        url: $utils.getRoute(resourceName, true),
        params: {
          id: '@id'
        },
        transformRequest: birthDateTransform
      },
    };

    return $resource(null, null, $utils.createResource(resourceName, customMethods));

  }

]);
