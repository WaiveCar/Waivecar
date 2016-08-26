module.exports = {
  api : {
    uri    : 'https://api-staging.waivecar.com',
    //uri    : 'https://api-waivecar-dev.cleverbuild.biz',
    port   : 443,
    socket : {
      uri     : 'https://api-staging.waivecar.com',
      //uri     : 'https://api-waivecar-dev.cleverbuild.biz',
      options : {
        path : '/socket/socket.io'
      }
    }
  }
};
