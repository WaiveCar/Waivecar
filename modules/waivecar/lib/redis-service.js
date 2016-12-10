'use strict';

let uuid      = require('uuid');
let wrapper   = require('co-redis');

module.exports = (function() {
  let client = null;
  if (Bento.config.queue && Bento.config.queue.redis) {
    let port = Bento.config.queue.redis.port;
    let host = Bento.config.queue.redis.host;
    client = require('redis').createClient(port, host, Bento.config.queue.redis);
  } else {
    client = require('redis').createClient();
  }

  let res = wrapper(client);

  res.lockTimeMS = 40000;

  // These both sound like reasonable names.
  res.shouldProceed = res.shouldProcess = function *(type, id) {
    //
    // Currently (2016-12-09) the scheduler goes every 45 seconds and there's
    // a 30 second timeout on the api call to get the car info. Ideally, these
    // things shouldn't matter - but I'm pretending they do just in case.
    //
    // A smart observer will notice there's a way this leads to a remote 
    // possibility of a booking being skipped one time ... you get extra 
    // points - but honestly that's unlikely and not a big deal.
    //
    let key = `LOCK:${ type }:${ id }`;

    // The uuid here is used to work around the fact that get/set isn't atomic.
    let uniq = uuid.v4();

    // The nx will only only succeed if the key hasn't been set. 
    let canProceed = yield res.set(key, uniq, 'nx', 'px', res.lockTimeMS);
    let check = yield res.get(key);
    return (canProceed && check === uniq);
  }
  return res;
  
})();
