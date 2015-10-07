'use strict';

module.exports = {
  name  : 'views',
  store : {
    key    : 'view',
    method : 'POST',
    uri    : '/ui/views'
  },
  index : {
    key    : 'views',
    method : 'GET',
    uri    : '/ui/views'
  },
  show : {
    key    : 'view',
    method : 'GET',
    uri    : '/ui/views/:id'
  },
  update : {
    key    : 'view',
    method : 'PUT',
    uri    : '/ui/views/:id'
  },
  delete : {
    key    : 'view',
    method : 'DELETE',
    uri    : '/ui/views/:id'
  }
};