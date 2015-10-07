'use strict';

module.exports = {
  name  : 'licenses',
  store : {
    key    : 'license',
    method : 'POST',
    uri    : '/licenses'
  },
  index : {
    key    : 'licenses',
    method : 'GET',
    uri    : '/licenses'
  },
  show : {
    key    : 'license',
    method : 'GET',
    uri    : '/licenses/:id'
  },
  update : {
    key    : 'license',
    method : 'PUT',
    uri    : '/licenses/:id'
  },
  delete : {
    key    : 'license',
    method : 'DELETE',
    uri    : '/licenses/:id'
  }
};