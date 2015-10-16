module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | User
   |--------------------------------------------------------------------------------
   |
   | admins : Array    > List of admin users to create if user table is empty.
   | params : Array    > List of required parameters when creating a new user.
   | filter : Function > Function providing the available filtering options for the
   |                     user.
   |
   */

  user : {
    users : [
      {
        firstName     : 'Matt',
        lastName      : 'Ginty',
        email         : 'matt.ginty@clevertech.biz',
        password      : 'lollipop0',
        role          : 'admin',
        verifiedEmail : true,
        status        : 'active'
      },
      {
        firstName     : 'Christoffer',
        lastName      : 'Rødvik',
        email         : 'christoffer@clevertech.biz',
        password      : 'password',
        role          : 'admin',
        verifiedEmail : true,
        status        : 'active',
        facebook      : '10153354349045449'
      },
      {
        firstName     : 'Zoli',
        lastName      : 'Honig',
        email         : 'zoli@waivecar.com',
        password      : 'password',
        role          : 'admin',
        verifiedEmail : true,
        status        : 'active'
      },
      {
        firstName     : 'Issac',
        lastName      : '',
        email         : 'ideutsch@waivecar.com',
        password      : 'password',
        role          : 'admin',
        verifiedEmail : true,
        status        : 'active'
      }
    ],
    params : [
      'firstName',
      'lastName',
      'email',
      'phone',
      'password'
    ],
    ui : {
      resources : {
        users : require('./resources/users')
      },
      fields : {
        users : require('./fields/users')
      }
    },
    filter : function (query, options) {
      return query(options, {
        where : {
          role          : query.STRING,
          firstName     : { $like : query.STRING },
          lastName      : { $like : query.STRING },
          phone         : query.STRING,
          email         : query.STRING,
          verifiedPhone : query.BOOLEAN,
          verifiedEmail : query.BOOLEAN,
          facebook      : query.STRING,
          stripeId      : query.STRING
        }
      });
    }
  }

};