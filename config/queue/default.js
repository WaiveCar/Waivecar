module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | Queue
   |--------------------------------------------------------------------------------
   |
   | @param {String} prefix The prefix used when storing data in redis.
   | @param {Object} redis  The redis server configuration.
   |
   */

  queue : {
    prefix : 'queue',
    redis  : {
      host : 'datastore',
      port : 6379
    }
  }

};
