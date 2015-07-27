'use strict';

module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | MySql
   |--------------------------------------------------------------------------------
   |
   | Service config for MySQL
   |
   */

  mysql : {
    host     : 'localhost',
    database : '',
    user     : '',
    password : '',
    charset  : 'utf8_unicode_ci',
    _super   : {
      role      : 'admin',
      firstName : 'John',
      lastName  : 'Doe',
      email     : 'admin@batch.none',
      password  : 'password'
    }
  }

};