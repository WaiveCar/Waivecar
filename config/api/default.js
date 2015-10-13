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
   | NB      : Recommend ports: Website @ 8080, API @ 8081, Test @ 8082, & App @ 8100.
   */

  api : {
    name    : 'WaiveCar',
    version : '0.5.3',
    port    : 8081,
    uri     : 'http://localhost:8081',
    cors    : {
      origins : [ 'https://waivecar-dev.cleverbuild.biz', 'http://localhost:8080', 'http://localhost:8100' ],
      headers : [ 'Content-Type', 'Cache-Control', 'X-Requested-With', 'Authorization', 'Role' ]
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
    email : 'info@waivecar.com',
    phone : '555 55 555'
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