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
   | NB      : Recommend ports: Website @ 3000, Admin @ 8080, API @ 8081, & App @ 8100.
   */

  api : {
    name    : 'WaiveCar',
    version : '0.1.0',
    port    : 3000,
    uri     : 'http://localhost:3000',
    cors    : {
      origins : [ 'https://waivecar-dev.cleverbuild.biz', 'https://admin-waivecar-dev.cleverbuild.biz', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:8100' ],
      headers : [ 'Content-Type', 'Cache-Control', 'X-Requested-With', 'Authorization' ]
    }
  },

  /*
   |--------------------------------------------------------------------------------
   | Cluster Settings
   |--------------------------------------------------------------------------------
   | cpus : How many cpu's to cluster.
   |        Note that when this setting is omitted it will use the number of
   |        available CPUs on your server.
   |
   */

  // cluster : {
  //   cpus : 1
  // },

  /*
   |--------------------------------------------------------------------------------
   | Socket Settings
   |--------------------------------------------------------------------------------
   |
   | Reach API runs with a seperate socket server using socket.io-emitter to support
   | running the API on a cluster. All socket.io events are passed through a single
   | socket.io server.
   |
   | port    : number > The port number for the socket server to listen on
   | origins : string > A list of url origins allowed to access the server
   | redis   : object > Redis settings for use with communicating between cluster
   |                     instances and socket server.
   |
   | For more information on reach-socket go to the github page for reach-socket
   |
   | @author Christoffer Rødvik
   | @github https://github.com/kodemon/reach-socket
   |
   */

  socket : {
    port  : 5000,
    redis : {
      host : 'localhost',
      port : 6379
    }
  },

  /*
   |--------------------------------------------------------------------------------
   | Support Settings
   |--------------------------------------------------------------------------------
   |
   | Support settings are used in the reach-api error handler when the server hits
   | a 500 INTERNAL ERROR. The support information is passed to the client and can
   | be used in a 500 client side handler to provide contact information to remedy
   | or report an issue.
   |
   */

  support : {
    email : 'support@your.domain.com',
    phone : '555 55 555'
  },

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
      console : 'debug',
      file    : 'error',
      email   : 'error'
    }
  }

};