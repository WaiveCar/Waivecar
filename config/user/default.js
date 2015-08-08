module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | User
   |--------------------------------------------------------------------------------
   |
   | filter : Function providing the available filtering options for the user
   |
   */

  user : {
    filter : function (query, options) {
      return query(options, {
        where : {
          firstName : { $like : query.STRING },
          lastName  : { $like : query.STRING },
          email     : query.STRING,
          facebook  : query.STRING,
          twitter   : query.STRING,
          linkedin  : query.STRING,
          stripeId  : query.STRING
        }
      });
    }
  }

};