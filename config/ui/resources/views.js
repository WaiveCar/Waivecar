'use strict';

module.exports = {
  name  : 'views',
  store : {
    key    : 'view',
    method : 'POST',
    uri    : '/views'
  },
  index : {
    key    : 'views',
    method : 'GET',
    uri    : '/views'
  },
  show : {
    key    : 'view',
    method : 'GET',
    uri    : '/views/:id'
  },
  update : {
    key    : 'view',
    method : 'PUT',
    uri    : '/views/:id'
  },
  delete : {
    key    : 'view',
    method : 'DELETE',
    uri    : '/views/:id'
  }
};