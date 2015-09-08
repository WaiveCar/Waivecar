'use strict';

module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | API Settings
   |--------------------------------------------------------------------------------
   |
   | The various API settings that define how your API reacts to incoming requests.
   |
   | name    : The name of your API service
   | version : The version of your API service
   | port    : The port on which to run the API service
   | uri     : The full url address including port to your API service
   | cors    : Origins and headers allowed to access the API service
   | sites   : The application type of incoming requests
   |
   */

  api : {
    port : 8082,
    uri  : 'http://localhost:8082'
  },

  /*
   |--------------------------------------------------------------------------------
   | Log Settings
   |--------------------------------------------------------------------------------
   |
   | This API by default uses winston to log events, here you can define at what
   | error levels the winston adapters should trigger a logging event.
   |
   */

  log : {
    level : {
      console : 'info',
      file    : 'ignore',
      email   : 'ignore'
    }
  },

  /*
   |--------------------------------------------------------------------------------
   | Test
   |--------------------------------------------------------------------------------
   */

  test : {
    custom : [
      'interface/models/user'
    ],
    modules : [
      'auth',
      'user',
      'log'
    ],
    providers : [
      'gm-api',
      'email',
      'sms'
    ]
  }

};