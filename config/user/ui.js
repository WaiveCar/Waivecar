module.exports = {
  
  /*
   |--------------------------------------------------------------------------------
   | UI
   |--------------------------------------------------------------------------------
   |
   | The UI is the modules settings being passed down to a front end so that the
   | service can produce proper interaction layout for interacting with the module.
   |
   */

  ui : {
    Users : {
      active     : true,
      icon       : 'people',
      href       : '/#/users',
      categories : [ 'personal', 'social', 'financial' ],
      fields     : {
        personal : [
          {
            label       : 'Firstname',
            component   : 'input',
            type        : 'text',
            name        : 'firstName',
            placeholder : 'Enter your firstname',
            required    : true
          },
          {
            label       : 'Lastname',
            component   : 'input',
            type        : 'text',
            name        : 'lastName',
            placeholder : 'Enter your lastname',
            required    : true
          },
          {
            label       : 'Email',
            component   : 'input',
            type        : 'text',
            name        : 'email',
            placeholder : 'Enter your email',
            required    : true
          },
          {
            label     : 'Role',
            component : 'input',
            type      : 'text',
            name      : 'role',
            readOnly  : true
          }
        ],
        social : [
          {
            label     : 'Facebook',
            component : 'input',
            type      : 'text',
            name      : 'facebook',
            readOnly  : true
          },
          {
            label     : 'Twitter',
            component : 'input',
            type      : 'text',
            name      : 'twitter',
            readOnly  : true
          },
          {
            label     : 'LinkedIn',
            component : 'input',
            type      : 'text',
            name      : 'linkedin',
            readOnly  : true
          }
        ],
        financial : [
          {
            label     : 'Stripe',
            component : 'input',
            type      : 'text',
            name      : 'stripeId',
            readOnly  : true
          }
        ]
      }
    }
  }

}