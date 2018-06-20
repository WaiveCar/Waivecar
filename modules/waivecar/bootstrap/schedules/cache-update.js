'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Redis     = require('../../lib/redis-service.js');
let request   = require('co-request');

module.exports = function *() {
  scheduler.add('cache-update', {
    init   : true,
    repeat : true,
    timer  : {
      value : 6,
      type  : 'hour'
    }
  });
};

scheduler.process('cache-update', function *(job) {
  let reqPointList = yield Redis.hkeys('cache');

  for(let ix = 0; ix < reqPointList.length; ix++) {
    try {
      let reqJSON = JSON.parse(reqPointList[ix]);
      let reqResponse = yield request(reqJSON);
      if(reqResponse.body && reqResponse.body.length > 1) {
        yield Redis.hset('cache', cache_point, reqResponse.body);
      }
    } catch(ex) { }
  }
});
