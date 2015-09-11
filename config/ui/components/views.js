'use strict';

module.exports = [
  {
    name    : 'ViewsList',
    type    : 'table',
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
    type    : 'form',
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
    type    : 'form',
    fields  : [ 'id', 'userId', 'name', 'route', 'menus', 'role', 'status', 'layout' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  }
];
