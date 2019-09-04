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
    version : '0.2.0',
    port    : 8081,
    uri     : 'http://localhost:8081',
    cors    : {
      origins : ['http://waive.com', 'https://waive.com', 'https://lb.waivecar.com', 'http://staging.waivecar.com:8080', 'http://staging.waivecar.com:8081', 'http://127.0.0.1:8081'],
      headers : [ 'Content-Type', 'Cache-Control', 'X-Requested-With', 'Authorization' ]
    },
    log : {
      timeFormat : 'YYYY-MM-DD HH:mm:ss'
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
    uri : 'https://lb.waivecar.com'
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
    host : 'datastore',
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
      host : 'datastore',
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
   | Users
   |--------------------------------------------------------------------------------
   |
   | List of default uers to create when the api sets up a clean database.
   |
   */

  users : [
    {
      firstName : 'John',
      lastName  : 'Doe',
      email     : 'admin@fixture.none',
      password  : 'admin',
      role      : 'Super User'
    }
  ],

  /*
   |--------------------------------------------------------------------------------
   | Groups
   |--------------------------------------------------------------------------------
   |
   | List of custom groups to register when api sets up a clean database.
   |
   */

  groups : []

};
