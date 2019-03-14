'use strict';
var angular = require('angular');
require('../services/utils.js');
var _ = require('lodash');

module.exports = angular.module('app').factory('Users', [
  '$resource',
  '$utils',
  function ($resource, $utils) {

    var transformRequest = function (data) {
      if (!data) {
        return data;
      }
      data = angular.copy(data);
      data = _.pick(data, ['email', 'fullName', 'firstName', 'lastName', 'phone', 'password', 'tested']);

      return angular.toJson(data);
    };

    var resource = $resource(null, null, $utils.createResource('users', {
      create: {
        method: 'POST',
        url: $utils.getRoute('users', true),
        isArray: false,
        transformRequest: transformRequest,
      },
      update: {
        method: 'PUT',
        url: $utils.getRoute('users', true),
        params: {
          id: '@id'
        },
        transformRequest: transformRequest
      },
      tags: {
        method: 'PUT',
        url: $utils.getCustomRoute('users/tags/:verb/:tag'),
        params: {
          verb: '@verb',
          tag: '@tag'
        }
      },        

      login: {
        method: 'POST',
        url: $utils.getCustomRoute('auth/login')
      },
      logout: {
        method: 'POST',
        url: $utils.getCustomRoute('auth/logout')
      },
      me: {
        method: 'GET',
        url: $utils.getCustomRoute('users/me')
      },
      createCustomer: {
        method: 'POST',
        url: $utils.getCustomRoute('shop/customers')
      },
      createCard: {
        method: 'POST',
        url: $utils.getCustomRoute('payments/cards')
      },
    }));

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
