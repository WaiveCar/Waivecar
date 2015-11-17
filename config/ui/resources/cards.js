'use strict';

module.exports = {
  name  : 'cards',
  store : {
    key    : 'card',
    method : 'POST',
    uri    : '/cards'
  },
  index : {
    key    : 'cards',
    method : 'GET',
    uri    : '/cards'
  },
  show : {
    key    : 'card',
    method : 'GET',
    uri    : '/cards/:id'
  },
  update : {
    key    : 'card',
    method : 'PUT',
    uri    : '/cards/:id'
  },
  delete : {
    key    : 'card',
    method : 'DELETE',
    uri    : '/cards/:id'
  }
};
