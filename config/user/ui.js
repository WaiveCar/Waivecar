module.exports = {
  
  /*
   |--------------------------------------------------------------------------------
   | UI
   |--------------------------------------------------------------------------------
   |
   | The UI is the modules settings being passed down to a front end so that the
   | service can produce proper interaction layout for interacting with the module.
   |
   | The UI serves to present models to an administration interface and is
   | specificaly made with reach-admin in mind.
   |
   | active : Boolean > Setting this to false will result in the module not being
   |                    visible in the administrator front end.
   | icon   : String  > The icon id that represents the module.
   | views  : Array   > The settings used to create dynamic admin views.
   | fields : Array   > A list of fields representing the model.
   |
   */

  ui : {
    users : {
      active : true,
      icon   : 'people',
      path   : '/users',
      views  : [
        {
          type   : 'list',
          name   : 'Users',
          uri    : '/users',
          form   : 'user',
          fields : [ 'firstName', 'lastName', 'role', 'email' ]
        },
        {
          type : 'crud',
          childRoutes : [
            {
              name       : 'Create User',
              path       : '/create',
              type       : 'form',
              categories : [
                {
                  name   : 'Create User',
                  fields : [ 'firstName', 'lastName', 'role', 'email', 'password' ]
                }
              ]
            }
          ]
        }
      ],
      forms : {
        user : {
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
            ]
          },
          firstName : {
            component : 'input',
            type      : 'text',
            required  : true
          },
          lastName : {
            component : 'input',
            type      : 'text',
            required  : true
          },
          email : {
            component : 'input',
            type      : 'email',
            required  : true
          },
          password :  {
            component : 'input',
            type      : 'password',
            required  : true
          }
        }
      }
    }
  }

}