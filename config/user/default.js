module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | User
   |--------------------------------------------------------------------------------
   |
   | @param {Array}    users  A list of users to register by default.
   | @param {Array}    params A list of parameters required for user registration.
   | @param {Object}   ui     The bentojs UI configuration.
   | @param {Function} filter The query filter available on the user model.
   |
   */

  user : {
    users : [
      {
        firstName     : 'Matt',
        lastName      : 'Ginty',
        email         : 'matt.ginty@clevertech.biz',
        password      : 'lollipop0',
        phone         : '430099449',
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

    filter : function(queryParser, query) {
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
