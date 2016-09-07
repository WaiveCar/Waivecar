module.exports = {
  api : {
    uri    : 'http://api-local.waivecar.com',
    port   : 3080,
    socket : {
      uri     : 'http://api-local.waivecar.com:3080',
      options : {
         path : '/socket/socket.io'
      }
    }
  }
};
