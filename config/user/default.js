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
        role      : 'admin',
        firstName : 'John',
        lastName  : 'Doe',
        email     : 'admin@fixture.none',
        password  : 'admin'
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
