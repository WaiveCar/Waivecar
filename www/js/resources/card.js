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
  function(Resource) {

    function transformRequest(data) {
      if (data && data.card) {
        data = angular.copy(data);
        var date = data.card.expiry.split('/');
        data.card.exp_month = date[0];
        data.card.exp_year = date[1];
        delete data.card.expiry;
      }
      return angular.toJson(data);
    }

    return Resource('/shop/cards/:id', {
      id: '@id'
    }, {
      create: {
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
