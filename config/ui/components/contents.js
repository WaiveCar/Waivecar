'use strict';

module.exports = [
  {
    name    : 'ContentsList',
    title   : 'Content',
    type    : 'Table',
    fields  : [ 'id', 'html' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  },
  {
    name    : 'ContentsShow',
    title   : 'Content',
    type    : 'Content',
    fields  : [ 'id', 'html' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  }
];
