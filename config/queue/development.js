module.exports = {
  queue : {
    prefix : 'queue',
    redis  : {
      host : process.env.COPILOT_REDIS || 'datastore',
      port : 6379
    }
  }
};
