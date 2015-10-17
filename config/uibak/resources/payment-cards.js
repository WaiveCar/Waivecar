'use strict';

module.exports = {
  name  : 'cards',
  store : {
    key    : 'payment-card',
    method : 'POST',
    uri    : '/payments/cards'
  },
  index : {
    key    : 'payment-cards',
    method : 'GET',
    uri    : '/payments/cards'
  },
  show : {
    key    : 'payment-card',
    method : 'GET',
    uri    : '/payments/cards/:id'
  },
  update : {
    key    : 'payment-card',
    method : 'PUT',
    uri    : '/payments/cards/:id'
  },
  delete : {
    key    : 'payment-card',
    method : 'DELETE',
    uri    : '/payments/cards/:id'
  }
};