'use strict';

module.exports = {
  name  : 'payments',
  store : {
    key    : 'payment',
    method : 'POST',
    uri    : '/payments'
  },
  index : {
    key    : 'payments',
    method : 'GET',
    uri    : '/payments'
  },
  show : {
    key    : 'payment',
    method : 'GET',
    uri    : '/payments/:id'
  },
  update : {
    key    : 'payment',
    method : 'PUT',
    uri    : '/payments/:id'
  },
  delete : {
    key    : 'payment',
    method : 'DELETE',
    uri    : '/payments/:id'
  }
};