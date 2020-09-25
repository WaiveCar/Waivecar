module.exports = {
  app : {
    uri  : 'http://' + (process.env.COPILOT_LB_DNS || 'staging.waivecar.com').toLowerCase(),
    port : 8080
  }
};
