angular.module('app').factory('Licenses', [
  '$resource',
  '$utils',
  function Resource($resource, $utils) {
    'use strict';

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
