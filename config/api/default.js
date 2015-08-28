module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | API
   |--------------------------------------------------------------------------------
   |
   | api    : String  > Uri endpoint to the API the app is consuming.
   | port   : Integer > Port the API is running on.
   | socket : Object > The socket settings for the API
   |   uri     : String > The url:port endpoint where the API socket is listening.
   |   options : Object > Socket.io options
   |
   */

  api : {
    uri    : 'http://localhost',
    port   : 8081,
    socket : {
      uri     : 'http://localhost:5000',
      options : null
    }
  }

};
