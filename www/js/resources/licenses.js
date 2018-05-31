'use strict';
var angular = require('angular');
require('../services/utils.js');
var moment = require('moment');

module.exports = angular.module('app').factory('Licenses', [
  '$resource',
  '$utils',
  '$settings',
  function ($resource, $utils, $settings) {

    var resourceName = 'licenses';

    var transformRequest = function (data) {
      if (!data) {
        return data;
      }
      data = angular.copy(data);
      if (data.birthDate) {
        data.birthDate = moment(data.birthDate, 'MM-DD-YYYY').format('YYYY-MM-DD');
      }
      delete data.createdAt;
      delete data.updatedAt;
      delete data.deletedAt;

      return angular.toJson(data);

    };

    var transformResponse = function (data) {
      if (data == null) {
        return data;
      }
      data = angular.fromJson(data);
      if (data.birthDate) {
        data.birthDateOriginal = data.birthDate;
        data.birthDate = moment(data.birthDate).toDate();
      }
      return data;

    };

    var customMethods = {
      create: {
        method: 'POST',
        url: $utils.getRoute(resourceName),
        isArray: false,
        transformRequest: transformRequest,
        transformResponse: transformResponse
      },
      update: {
        method: 'PUT',
        url: $utils.getRoute(resourceName, true),
        params: {
          id: '@id'
        },
        transformRequest: transformRequest,
        transformResponse: transformResponse
      },
      query: {
        method: 'GET',
        url: $utils.getRoute(resourceName),
        isArray: true,
      },
      get: {
        method: 'GET',
        url: $utils.getRoute(resourceName, true),
        transformResponse: transformResponse,
        params: {
          id: '@id'
        }
      },
      verify: {
        method: 'POST',
        url: $settings.uri.api + '/licenses/:id/verify',
        params: {
          id: '@id'
        },
        transformRequest: transformRequest,
        transformResponse: transformResponse
      }
    };

    var resource = $resource(null, null, $utils.createResource(resourceName, customMethods));

    resource.prototype.filePath = function(){
      return this.fileId ? ($settings.uri.api + '/files/' + this.fileId) : null;
    };

    resource.prototype.$save = function () {
      if (!this.id) {
        return this.$create();
      } else {
        return this.$update();
      }
    };

    return resource;

  }

]);
