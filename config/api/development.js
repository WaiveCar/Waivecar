module.exports = {
  api : {
    uri    : 'http://' + (process.env.COPILOT_LB_DNS || 'staging.waivecar.com').toLowerCase(),
    port   : 3080,
    socket : {
      uri     : 'http://' + (process.env.COPILOT_LB_DNS || 'staging.waivecar.com').toLowerCase() + ':3080',
      options : {
         path : '/socket/socket.io'
      }
    }
  }
};
