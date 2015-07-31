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
    uri  : 'http://local.io:8081',
    port : 8081,
    cors : {
      origins : ['http://local.io:3081'],
      headers : ['Content-Type', 'Cache-Control', 'X-Requested-With', 'Authorization']
    },
    sites : {
      admin : ['http://local.io:3001']
    }
  }

};