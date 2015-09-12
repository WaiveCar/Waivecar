'use strict';

module.exports = [
  {
    name    : 'LogsList',
    type    : 'Table',
    title   : 'Logs',
    fields  : [ 'id', 'resolved', 'ip', 'uri', 'code', 'message', 'data', 'stack' ],
    actions : {
      cancel : true,
      create : true,
      update : true,
      delete : true
    }
  },
  {
    name    : 'LogsShow',
    title   : 'Log',
    type    : 'Form',
    fields  : [ 'id', 'resolved', 'ip', 'uri', 'code', 'message', 'data', 'stack' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  }
];
