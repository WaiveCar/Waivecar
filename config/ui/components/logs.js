'use strict';

module.exports = [
  {
    name    : 'LogsList',
    type    : 'Table',
    title   : 'Logs',
    fields  : [ 'id', 'resolved', 'ip', 'uri', 'code', 'message', 'data', 'stack' ],
    actions : {
      cancel : true,
      create : false,
      update : false,
      delete : true
    }
  }
];
