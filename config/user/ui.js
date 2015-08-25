'use strict';

module.exports = {
  ui : {
    users : {
      active   : true,
      resource : {
        list : {
          method : 'GET',
          uri    : '/users'
        },
        show : {
          method : 'GET',
          uri    : '/users/:id'
        },
        create : {
          method : 'POST',
          uri    : '/users'
        },
        update : {
          method : 'PUT',
          uri    : '/users/:id'
        },
        destroy : {
          method : 'DELETE',
          uri    : '/users/:id'
        }
      },
      views : {
        list : {
          route       : '/users',
          type        : 'table',
          name        : 'Users',
          description : null,
          fields      : [ 'id', 'firstName', 'lastName', 'role', 'email' ],
          actions     : {
            cancel  : true,
            create  : true,
            update  : true,
            destroy : true
          },
          menus : {
            sidebar : {
              name   : 'Users',
              icon   : 'people',
              parent : null
            }
          }
        },
        new : {
          route   : '/users/new',
          type    : 'form',
          name    : 'Add User',
          fields  : [ 'firstName', 'lastName', 'role', 'email', 'password' ],
          actions : {
            cancel  : true,
            create  : true,
            update  : false,
            destroy : false
          },
          menus : {
            sidebar : {
              name   : 'Add User',
              icon   : 'plus',
              parent : 'list'
            }
          }
        },
        show : {
          route   : '/users/:id',
          type    : 'form',
          name    : 'User',
          fields  : [ 'id', 'firstName', 'lastName', 'role', 'email' ],
          actions : {
            cancel  : true,
            create  : false,
            update  : true,
            destroy : true
          }
        },
      },
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
    }
  }
}