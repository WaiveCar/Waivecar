'use strict';

module.exports = {
  id : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Id',
    helpText  : null
  },
  userId : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'User',
    helpText  : null
  },
  name : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Name',
    helpText  : null
  },
  route : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Route',
    helpText  : null
  },
  menus : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Menus',
    helpText  : null
  },
  role : {
    component : 'select',
    options   : [
      {
        name  : 'Anonymous',
        value : 'anon'
      },
      {
        name  : 'User',
        value : 'user'
      },
      {
        name  : 'Admin',
        value : 'admin'
      }
    ],
    label    : 'Role',
    helpText : 'Select Access Level'
  },
  status : {
    component : 'select',
    options   : [
      {
        name  : 'Active',
        value : 'active'
      },
      {
        name  : 'Inactive',
        value : 'inactive'
      }
    ],
    label    : 'Status',
    helpText : 'Select a Status'
  },
  layout : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Layout',
    helpText  : null
  }
};