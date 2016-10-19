module.exports = {
  api : {
    uri    : 'http://api-staging.waivecar.com',
    //uri    : 'https://api-waivecar-dev.cleverbuild.biz',
    port   : 443,
    socket : {
      uri     : 'http://api-staging.waivecar.com',
      //uri     : 'https://api-waivecar-dev.cleverbuild.biz',
      options : {
        path : '/socket/socket.io'
      }
    }
  }
};
