'use strict';

module.exports = {
  name  : 'users',
  store : {
    method : 'POST',
    uri    : '/users'
  },
  index : {
    method : 'GET',
    uri    : '/users'
  },
  show : {
    method : 'GET',
    uri    : '/users/:id'
  },
  update : {
    method : 'PUT',
    uri    : '/users/:id'
  },
  delete : {
    method : 'DELETE',
    uri    : '/users/:id'
  }
};