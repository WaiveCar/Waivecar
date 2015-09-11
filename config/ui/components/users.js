'use strict';

module.exports = [
  {
    name    : 'UsersList',
    type    : 'table',
    fields  : [ 'id', 'email', 'firstName', 'lastName', 'role', 'status' ],
    actions : {
      cancel : true,
      create : true,
      update : true,
      delete : true
    }
  },
  {
    name    : 'UsersCreate',
    type    : 'form',
    fields  : [ 'firstName', 'lastName', 'role', 'email', 'password' ],
    actions : {
      cancel : true,
      create : true,
      update : false,
      delete : false
    }
  },
  {
    name    : 'UsersShow',
    type    : 'form',
    fields  : [ 'id', 'firstName', 'lastName', 'role', 'email', 'status' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  }
];
