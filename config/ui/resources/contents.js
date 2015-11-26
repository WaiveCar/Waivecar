'use strict';

module.exports = {
  name  : 'contents',
  store : {
    key    : 'content',
    method : 'POST',
    uri    : '/ui/contents'
  },
  index : {
    key    : 'contents',
    method : 'GET',
    uri    : '/ui/contents'
  },
  show : {
    key    : 'content',
    method : 'GET',
    uri    : '/ui/contents/:id'
  },
  update : {
    key    : 'content',
    method : 'PUT',
    uri    : '/ui/contents/:id'
  },
  delete : {
    key    : 'content',
    method : 'DELETE',
    uri    : '/ui/contents/:id'
  }
};