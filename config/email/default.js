'use strict';

module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | Email
   |--------------------------------------------------------------------------------
   |
   | Settings for email providers
   |
   */

  email : {
    templateFolder : 'config/email/templates',
    sender         : 'dev@waivecar.com',
    transportName  : 'mandrill',
    transport      : {
      auth : {
        apiKey : 'gHCYiqaKVIzJqfPqbrtPOA'
      }
    }
  }
};
