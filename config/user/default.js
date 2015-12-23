module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | User
   |--------------------------------------------------------------------------------
   |
   | @param {Array}    users  A list of users to register by default.
   | @param {Array}    params A list of parameters required for user registration.
   | @param {Function} filter The query filter available on the user model.
   |
   */

  user : {
    users : [
      {
        firstName : 'John',
        lastName  : 'Doe',
        email     : 'admin@fixture.none',
        password  : 'admin',
        role      : 5, // Super
      }
    ],

    params : [
      'firstName',
      'lastName',
      'email',
      'phone',
      'password'
    ],

    filter(queryParser, query) {
      return queryParser(query, {
        where : {
          id            : queryParser.NUMBER,
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
