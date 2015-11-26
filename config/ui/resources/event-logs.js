'use strict';

module.exports = {
  name  : 'event-logs',
  store : {
    method : 'POST',
    uri    : '/logs/event'
  },
  index : {
    method : 'GET',
    uri    : '/logs/event'
  },
  show : {
    method : 'GET',
    uri    : '/logs/event/:id'
  },
  update : {
    method : 'PUT',
    uri    : '/logs/event/:id'
  },
  delete : {
    method : 'DELETE',
    uri    : '/logs/event/:id'
  }
};
