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
    templateFolder : 'templates',
    sender         : 'matt.ginty@gmail.com',
    transportName  : 'mandrill',
    transport      : {
      auth : {
        apiKey : 'atA-wM7O5PXJn7hg38e4kA'
      }
    }
  }
};
