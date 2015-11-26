'use strict';

module.exports = {
  name  : 'error-logs',
  store : {
    method : 'POST',
    uri    : '/logs/error'
  },
  index : {
    method : 'GET',
    uri    : '/logs/error'
  },
  show : {
    method : 'GET',
    uri    : '/logs/error/:id'
  },
  update : {
    method : 'PUT',
    uri    : '/logs/error/:id'
  },
  delete : {
    method : 'DELETE',
    uri    : '/logs/error/:id'
  }
};
