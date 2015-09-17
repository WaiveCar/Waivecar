'use strict';

module.exports = [
  {
    name    : 'ContentsList',
    title   : 'Content',
    type    : 'Table',
    fields  : [ 'id', 'html' ],
    actions : {
      cancel : true,
      create : true,
      update : true,
      delete : true
    }
  },
  {
    name    : 'ContentsCreate',
    title   : 'Add Content',
    type    : 'Form',
    fields  : [ 'userId', 'html' ],
    actions : {
      cancel : true,
      create : true,
      update : false,
      delete : false
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
