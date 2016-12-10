'use strict';

let wrapper      = require('co-redis');

module.exports = (function() {
  let client = null;
  if (Bento.config.queue && Bento.config.queue.redis) {
    let port = Bento.config.queue.redis.port;
    let host = Bento.config.queue.redis.host;
    client = require('redis').createClient(port, host, Bento.config.queue.redis);
  } else {
    client = require('redis').createClient();
  }
  return wrapper(client);
})();
