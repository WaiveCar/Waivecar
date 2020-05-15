module.exports = {
  api : {
    uri    : 'http://staging.waivecar.com',
    port   : 3080,
    socket : {
      uri     : 'http://staging.waivecar.com:3080',
      options : {
         path : '/socket/socket.io'
      }
    }
  }
};
