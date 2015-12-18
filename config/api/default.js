module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | API Settings
   |--------------------------------------------------------------------------------
   |
   | The various API settings that define how your API reacts to incoming requests.
   |
   | @param {String}  name    The identifier of your API service.
   | @param {String}  version The version number of your API service.
   | @param {Integer} port    The port number to run your API service on.
   | @param {String}  uri     The uri to your API service.
   | @param {Object}  cors    The cors setting of your API service.
   |
   */

  api : {
    name    : 'WaiveCar',
    version : '1.0.4',
    port    : 8081,
    uri     : 'http://localhost:8081',
    cors    : {
      origins : null,
      headers : [ 'Content-Type', 'Cache-Control', 'X-Requested-With', 'Authorization' ]
    }
  },

  /*
   |--------------------------------------------------------------------------------
   | Web
   |--------------------------------------------------------------------------------
   |
   | @param {Object} uri
   |
   */

  web : {
    uri : 'https://www.waivecar.com'
  },

  /*
   |--------------------------------------------------------------------------------
   | Redis
   |--------------------------------------------------------------------------------
   |
   | @param {Object} redis
   |
   */

  redis : {
    host : 'localhost',
    port : 6379
  },

  /*
   |--------------------------------------------------------------------------------
   | Socket
   |--------------------------------------------------------------------------------
   |
   | The socket redis target that the API will be submitting socket events through.
   |
   | @param {Number} port
   | @param {Object} redis
   | @param {Object} api
   |
   */

  socket : {
    port  : 5000,
    redis : {
      host : 'localhost',
      port : 6379
    },
    api : {
      url   : 'http://localhost:8081',
      me    : '/users/me',
      roles : '/roles'
    }
  },

  /*
   |--------------------------------------------------------------------------------
   | Roles
   |--------------------------------------------------------------------------------
   |
   | A list of api roles from low to high determining access rights for modules
   | utilizing the authenticated role class.
   |
   | @param {Array} roles
   |
   */

  roles : [
    'guest',
    'user',
    'admin'
  ],

  /*
   |--------------------------------------------------------------------------------
   | Cluster
   |--------------------------------------------------------------------------------
   |
   | API cluster configuration properties.
   |
   | @param {Integer} cpus The amount of cpus spawn worker instances on.
   |
   */

  // cluster : {
  //   cpus : 1
  // },

  /*
   |--------------------------------------------------------------------------------
   | Log Settings
   |--------------------------------------------------------------------------------
   |
   | This API by default uses winston to log events, here you can define at what
   | error levels the winston adapters should trigger a logging event.
   |
   | @param {Object} level The various log levels
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
