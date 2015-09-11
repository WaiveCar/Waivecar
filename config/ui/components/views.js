'use strict';

module.exports = [
  {
    name    : 'ViewsList',
    type    : 'Table',
    title   : 'Views',
    fields  : [ 'id', 'userId', 'name', 'route', 'menus', 'role', 'status', 'layout' ],
    actions : {
      cancel : true,
      create : true,
      update : true,
      delete : true
    }
  },
  {
    name    : 'ViewsCreate',
    title   : 'Add View',
    type    : 'Form',
    fields  : [ 'name', 'route', 'layout', 'menus', 'role', 'status' ],
    actions : {
      cancel : true,
      create : true,
      update : false,
      delete : false
    }
  },
  {
    name    : 'ViewsShow',
    title   : 'View',
    type    : 'Form',
    fields  : [ 'id', 'userId', 'name', 'route', 'menus', 'role', 'status', 'layout' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  }
];
