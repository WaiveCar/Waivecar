'use strict';

module.exports = {
  active   : true,
  resource : {
    name : 'users',
    store : {
      key    : 'user',
      method : 'POST',
      uri    : '/users'
    },
    index : {
      key    : 'users',
      method : 'GET',
      uri    : '/users'
    },
    show : {
      key    : 'user',
      method : 'GET',
      uri    : '/users/:id'
    },
    update : {
      key    : 'user',
      method : 'PUT',
      uri    : '/users/:id'
    },
    delete : {
      key    : 'user',
      method : 'DELETE',
      uri    : '/users/:id'
    }
  },
  views : [
    {
      route       : '/users',
      type        : 'table',
      name        : 'Users',
      description : null,
      fields      : [ 'id', 'firstName', 'lastName', 'role', 'email' ],
      actions     : {
        cancel : true,
        create : true,
        update : true,
        delete : true
      },
      menus : {
        sidebar : {
          id     : 'list',
          name   : 'Users',
          icon   : 'people',
          parent : null
        }
      }
    },
    {
      route   : '/users/new',
      type    : 'form',
      name    : 'Add User',
      fields  : [ 'firstName', 'lastName', 'role', 'email', 'password' ],
      actions : {
        cancel : true,
        create : true,
        update : false,
        delete : false
      },
      menus : {
        sidebar : {
          id     : 'new',
          name   : 'Add User',
          icon   : 'plus',
          parent : 'list'
        }
      }
    },
    {
      route   : '/users/:id',
      type    : 'form',
      name    : 'User',
      fields  : [ 'id', 'firstName', 'lastName', 'role', 'email' ],
      actions : {
        cancel : true,
        create : false,
        update : true,
        delete : true
      }
    }
  ],
  fields : {
    role : {
      component : 'select',
      options   : [
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
      helpText : 'Select a Role'
    },
    firstName : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'First Name',
      helpText  : null
    },
    lastName : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Last Name',
      helpText  : null
    },
    email : {
      component : 'input',
      type      : 'email',
      required  : true,
      label     : 'Email Address',
      helpText  : null
    },
    password : {
      component : 'input',
      type      : 'password',
      required  : true,
      label     : 'Password',
      helpText  : 'choose a password longer than 6 characters'
    }
  }
};