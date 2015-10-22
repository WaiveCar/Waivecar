module.exports = {
  user : {

    /*
     |--------------------------------------------------------------------------------
     | Users
     |--------------------------------------------------------------------------------
     |
     | A list of users that gets inserted into the database by default if no user
     | records has been created.
     |
     | @param {Array}
     |
     */

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

    /*
     |--------------------------------------------------------------------------------
     | UI
     |--------------------------------------------------------------------------------
     |
     | The user resources, and fields settings for reach-ui utilized in react.
     |
     | @param {Object} resources List of user related resources
     | @param {Object} fields    List of user related fields
     |
     */

    ui : {
      resources : {
        users : require('./resources/users')
      },
      fields : {
        users : require('./fields/users')
      }
    },

    /*
     |--------------------------------------------------------------------------------
     | UI
     |--------------------------------------------------------------------------------
     |
     | Customizable query filter, this is used when a client is indexing the user
     | table.
     |
     | @param {Function} filter
     |
     */

    filter : function (queryParser, query) {
      return queryParser(query, {
        where : {
          role          : queryParser.STRING,
          firstName     : { $like : queryParser.STRING },
          lastName      : { $like : queryParser.STRING },
          phone         : queryParser.STRING,
          email         : queryParser.STRING,
          verifiedPhone : queryParser.BOOLEAN,
          verifiedEmail : queryParser.BOOLEAN,
          facebook      : queryParser.STRING,
          stripeId      : queryParser.STRING
        }
      });
    }

  }
};