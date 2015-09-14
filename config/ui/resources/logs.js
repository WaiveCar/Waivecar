'use strict';

module.exports = {
  name  : 'logs',
  index : {
    key    : 'logs',
    method : 'GET',
    uri    : '/log'
  },
  delete : {
    key    : 'log',
    method : 'DELETE',
    uri    : '/log/:id'
  }
};