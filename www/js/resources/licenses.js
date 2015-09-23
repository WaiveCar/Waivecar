'use strict';
var angular = require('angular');
require('../services/utils.js');
var moment = require('moment');

module.exports = angular.module('app').factory('Licenses', [
  'Resource',
  '$utils',
  '$settings',
  function (Resource, $utils, $settings) {

    var resourceName = 'licenses';

    var transformRequest = function (data) {
      if (!data) {
        return data;
      }
      data = angular.copy(data);
      if (data.birthDate) {
        data.birthDate = moment(data.birthDate).format('YYYY-MM-DD');
      }
      delete data.createdAt;
      delete data.updatedAt;
      delete data.deletedAt;

      return angular.toJson(data);

    };

    var transformResponse = function (data) {
      if (!data) {
        return data;
      }
      data = angular.fromJson(data);
      if (data.birthDate) {
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
      save: {
        method: 'POST',
        url: $utils.getRoute(resourceName, true),
        params: {
          id: '@id'
        },
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
      get: {
        method: 'GET',
        url: $utils.getRoute(resourceName, true),
        transformRequest: transformRequest,
        transformResponse: transformResponse
      },
    };

    var resource = Resource(null, {
      id: '@id'
    }, $utils.createResource(resourceName, customMethods));

    resource.prototype.filePath = function(){
      return this.fileId ? ($settings.uri.api + '/files/' + this.fileId) : null;
    };

    return resource;

  }

]);
