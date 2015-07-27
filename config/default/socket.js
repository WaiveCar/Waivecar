module.exports = {

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
    port    : 5000,
    origins : 'http://localhost:3000 http://localhost:3001',
    redis   : {
      host : 'localhost',
      port : 6379
    }
  }

};