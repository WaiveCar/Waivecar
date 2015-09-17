'use strict';

module.exports = {
  name  : 'contents',
  store : {
    key    : 'content',
    method : 'POST',
    uri    : '/contents'
  },
  index : {
    key    : 'contents',
    method : 'GET',
    uri    : '/contents'
  },
  show : {
    key    : 'content',
    method : 'GET',
    uri    : '/contents/:id'
  },
  update : {
    key    : 'content',
    method : 'PUT',
    uri    : '/contents/:id'
  },
  delete : {
    key    : 'content',
    method : 'DELETE',
    uri    : '/contents/:id'
  }
};