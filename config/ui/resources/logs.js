'use strict';

module.exports = {
  name  : 'logs',
  store : {
    key    : 'log',
    method : 'POST',
    uri    : '/logs'
  },
  index : {
    key    : 'logs',
    method : 'GET',
    uri    : '/logs'
  },
  show : {
    key    : 'log',
    method : 'GET',
    uri    : '/logs/:id'
  },
  update : {
    key    : 'log',
    method : 'PUT',
    uri    : '/logs/:id'
  },
  delete : {
    key    : 'log',
    method : 'DELETE',
    uri    : '/logs/:id'
  }
};