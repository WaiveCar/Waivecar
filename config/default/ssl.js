'use strict';

module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | SSL Settings
   |--------------------------------------------------------------------------------
   |
   | If you are running your server using HTTPS you will need to set up your
   | certificates. Add your certifications to the server and add the paths in the
   | ssl settings.
   |
   | Both the socket and server will make use of these settings.
   |
   */

  ssl : {
    active : false, // If set to false the server will run in http
    certs  : {
      path : 'path/to/ssl',
      key  : 'certification.key',
      cert : 'certification.crt',
      ca   : [
        'certification.crt',
        'certification.crt',
        'certification.crt'
      ]
    }
  }

};