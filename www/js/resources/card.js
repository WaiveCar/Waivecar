// Route.pst('/payments/cards',     ['authenticate', 'PaymentCardsController@create']);
// Route.get('/payments/cards',     ['authenticate', 'PaymentCardsController@index']);
// Route.get('/payments/cards/:id', ['authenticate', 'PaymentCardsController@show']);
// Route.put('/payments/cards/:id', ['authenticate', 'PaymentCardsController@update']);
// Route.del('/payments/cards/:id', ['authenticate', 'PaymentCardsController@delete']);

'use strict';
var angular = require('angular');
require('../services/resource-service');

module.exports = angular.module('app').factory('Card', [
  'Resource',
  '$utils',
  function(Resource, $utils) {

    function transformRequest(data) {
      if (data && data.expiry) {
        data = angular.copy(data);
        data.exp_month = data.expiry.getMonth() + 1;
        data.exp_year = data.expiry.getFullYear();
      }
      return angular.toJson(data);
    }

    return Resource('/payments/cards/:id', {
      id: '@id'
    }, {
      create: {
        url: $utils.getCustomRoute('payments/cards?id=:userId&service=stripe'),
        params: {
          userId: '@userId'
        },
        method: 'POST',
        isArray: false,
        transformRequest: transformRequest
      },
      update: {
        method: 'PUT',
        isArray: false,
        transformRequest: transformRequest
      }
    });

  }
]);
