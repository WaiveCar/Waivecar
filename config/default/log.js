'use strict';

module.exports = {

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
      console : 'debug',
      file    : 'error',
      email   : 'error'
    }
  }

};