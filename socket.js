'use strict';

let Reach  = require('reach-api');
let socket = require('reach-socket');

/*
  Socket Server
  =============
  The reach-api uses reach-socket (stand alone socket.io server) to emmit all socket events
  from back end to front end service.

  This is an optional file that can be executed seperately from the API if you wish to run
  the socket server on the same server as the API.

  This file uses the configuration defined in the ./config/socket directory.
 */

socket(Reach.config.socket);