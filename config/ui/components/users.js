'use strict';

module.exports = [
  {
    name    : 'UsersList',
    title   : 'Users',
    type    : 'Table',
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
    title   : 'Add User',
    type    : 'Form',
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
    title   : 'User',
    type    : 'Form',
    fields  : [ 'id', 'firstName', 'lastName', 'role', 'email', 'status' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  },
  {
    name    : 'Profile',
    title   : 'My Profile',
    type    : 'Profile',
    fields  : [ 'firstName', 'lastName', 'email' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : false
    }
  },
  {
    name    : 'UsersChart',
    title   : 'Users',
    type    : 'MiniChart',
    fields  : [ 'id', 'createdAt' ],
    actions : {
      cancel : false,
      create : false,
      update : false,
      delete : false
    }
  }
];
